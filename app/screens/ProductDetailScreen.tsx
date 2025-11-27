import { FC, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { fetchProduct } from "@/services/api/platzi-api"
import type { Product } from "@/services/api/platzi-api.types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { DatadogProfiler, TrackedLoading } from "@/utils/useDatadogTiming"
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

interface ProductDetailScreenProps extends AppStackScreenProps<"ProductDetail"> {}

export const ProductDetailScreen: FC<ProductDetailScreenProps> = function ProductDetailScreen({
  route,
  navigation,
}) {
  const { themed } = useAppTheme()
  const { productId } = route.params
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Track view loading with Datadog
  useDatadogViewLoadingComplete(!isLoading && !!product && !error)

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await fetchProduct(productId)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product")
      console.error("Error loading product:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [productId])

  const handleNextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const handlePreviousImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (isLoading) {
    return (
      <Screen preset="scroll" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" />
          <Text style={themed($loadingText)}>Loading product details...</Text>
        </View>
      </Screen>
    )
  }

  if (error || !product) {
    return (
      <Screen preset="scroll" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>Error: {error || "Product not found"}</Text>
          <Button
            text="Retry"
            onPress={loadProduct}
            style={themed($retryButton)}
            accessibilityLabel="Retry Loading Product"
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
      <DatadogProfiler name="ProductDetailContent">
        <ScrollView>
          <View style={themed($header)}>
          <Text preset="default" size="xs" style={themed($subtitle)}>
            ID: {product.id} • Datadog RUM tracking
          </Text>
        </View>

        {/* Image Gallery */}
        {product.images.length > 0 && (
          <TrackedLoading name="product_image_gallery">
            <View style={themed($imageGallery)}>
              <Image
                source={{ uri: product.images[currentImageIndex] }}
                style={$productImage}
                resizeMode="cover"
              />
              {product.images.length > 1 && (
                <View style={themed($imageControls)}>
                  <Button
                    text="←"
                    onPress={handlePreviousImage}
                    style={themed($imageButton)}
                    textStyle={themed($imageButtonText)}
                    accessibilityLabel="Previous Product Image"
                  />
                  <Text style={themed($imageCounter)}>
                    {currentImageIndex + 1} / {product.images.length}
                  </Text>
                  <Button
                    text="→"
                    onPress={handleNextImage}
                    style={themed($imageButton)}
                    textStyle={themed($imageButtonText)}
                    accessibilityLabel="Next Product Image"
                  />
                </View>
              )}
            </View>
          </TrackedLoading>
        )}

        {/* Product Info */}
        <TrackedLoading name="product_info_card">
          <Card
            style={themed($card)}
            ContentComponent={
              <View style={themed($cardContent)}>
                <Text preset="bold" size="xl" style={themed($productTitle)}>
                  {product.title}
                </Text>

              <View style={themed($row)}>
                <Text preset="bold" size="xxl" style={themed($price)}>
                  ${product.price}
                </Text>
                <View style={themed($categoryBadge)}>
                  <Text preset="default" size="xs" style={themed($categoryText)}>
                    {product.category.name}
                  </Text>
                </View>
              </View>

              <View style={themed($divider)} />

              <Text preset="subheading" style={themed($sectionTitle)}>
                Description
              </Text>
              <Text preset="default" size="md" style={themed($description)}>
                {product.description}
              </Text>

              <View style={themed($divider)} />

              <Text preset="subheading" style={themed($sectionTitle)}>
                Product Information
              </Text>
              <View style={themed($infoRow)}>
                <Text preset="bold" size="sm">
                  SKU:
                </Text>
                <Text preset="default" size="sm" style={themed($infoValue)}>
                  {product.slug}
                </Text>
              </View>
              <View style={themed($infoRow)}>
                <Text preset="bold" size="sm">
                  Created:
                </Text>
                <Text preset="default" size="sm" style={themed($infoValue)}>
                  {new Date(product.creationAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={themed($infoRow)}>
                <Text preset="bold" size="sm">
                  Last Updated:
                </Text>
                <Text preset="default" size="sm" style={themed($infoValue)}>
                  {new Date(product.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              </View>
            }
          />
        </TrackedLoading>

        </ScrollView>
      </DatadogProfiler>
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  flex: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $imageGallery: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  borderRadius: 12,
  overflow: "hidden",
})

const $productImage: ImageStyle = {
  width: "100%",
  height: 300,
}

const $imageControls: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: spacing.sm,
  backgroundColor: colors.palette.overlay20,
})

const $imageButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 0,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
})

const $imageButtonText: ThemedStyle<TextStyle> = () => ({
  fontSize: 20,
})

const $imageCounter: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $productTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.md,
})

const $price: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.success,
})

const $categoryBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
})

const $categoryText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $divider: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginVertical: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $description: ThemedStyle<TextStyle> = ({ spacing }) => ({
  lineHeight: 24,
  marginBottom: spacing.sm,
})

const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.xs,
})

const $infoValue: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
  flex: 1,
})

const $backToListButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = () => ({
  minWidth: 120,
})

