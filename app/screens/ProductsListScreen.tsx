import { FC, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { fetchProducts } from "@/services/api/platzi-api"
import type { Product } from "@/services/api/platzi-api.types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { trackAction } from "@/utils/datadog"
import { DatadogProfiler } from "@/utils/useDatadogTiming"
import { useDatadogViewLoadingComplete } from "@/utils/useDatadogViewTracking"

interface ProductsListScreenProps extends AppStackScreenProps<"ProductsList"> {}

export const ProductsListScreen: FC<ProductsListScreenProps> = function ProductsListScreen({
  navigation,
}) {
  const { themed } = useAppTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const LIMIT = 10

  // Track view loading with Datadog
  useDatadogViewLoadingComplete(!isLoading && !error)

  const loadProducts = async (currentOffset: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const data = await fetchProducts(currentOffset, LIMIT)

      if (append) {
        setProducts((prev) => [...prev, ...data])
      } else {
        setProducts(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
      console.error("Error loading products:", err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    loadProducts(0)
  }, [])

  const handleLoadMore = () => {
    if (!isLoadingMore) {
      const newOffset = offset + LIMIT
      setOffset(newOffset)
      loadProducts(newOffset, true)
    }
  }

  const handleRefresh = () => {
    setOffset(0)
    loadProducts(0)
  }

  const handleProductPress = (productId: number) => {
    trackAction("ProductSelected", "tap", { product_id: productId })
    navigation.navigate("ProductDetail", { productId })
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      onPress={() => handleProductPress(item.id)}
      accessibilityLabel={`View details for ${item.title}`}
    >
      <Card
        style={themed($card)}
        HeadingComponent={
          <View style={themed($cardHeader)}>
            {item.images[0] && (
              <Image source={{ uri: item.images[0] }} style={$productImage} resizeMode="cover" />
            )}
          </View>
        }
        ContentComponent={
          <View style={themed($cardContent)}>
            <Text preset="bold" size="md" numberOfLines={2}>
              {item.title}
            </Text>
            <Text preset="default" size="xs" style={themed($category)}>
              {item.category.name}
            </Text>
            <Text preset="default" size="sm" numberOfLines={3} style={themed($description)}>
              {item.description}
            </Text>
            <Text preset="bold" size="lg" style={themed($price)}>
              ${item.price}
            </Text>
          </View>
        }
      />
    </Pressable>
  )

  if (isLoading && products.length === 0) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" />
          <Text style={themed($loadingText)}>Loading products...</Text>
        </View>
      </Screen>
    )
  }

  if (error && products.length === 0) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>Error: {error}</Text>
          <Button
            text="Retry"
            onPress={handleRefresh}
            style={themed($retryButton)}
            accessibilityLabel="Retry Loading Products"
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)} safeAreaEdges={["bottom"]}>
      <View style={themed($header)}>
        <Text preset="default" size="sm" style={themed($subtitle)}>
          Loaded {products.length} products • Datadog RUM tracking enabled
        </Text>
      </View>

      <DatadogProfiler name="ProductsFlatList">
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={themed($listContent)}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={themed($footerLoader)}>
                <ActivityIndicator size="small" />
                <Text style={themed($footerText)}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      </DatadogProfiler>

      <View style={themed($footer)}>
        <Button
          text="Refresh"
          onPress={handleRefresh}
          preset="reversed"
          accessibilityLabel="Refresh Products List"
        />
      </View>
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

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardHeader: ThemedStyle<ViewStyle> = () => ({
  padding: 0,
})

const $productImage: ImageStyle = {
  width: "100%",
  height: 200,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
}

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $category: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginTop: spacing.xxs,
})

const $description: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $price: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  color: colors.palette.success,
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

const $footerLoader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.md,
})

const $footerText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
})

