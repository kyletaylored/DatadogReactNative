import { ExpoConfig, ConfigContext } from "@expo/config"

/**
 * Use tsx/cjs here so we can use TypeScript for our Config Plugins
 * and not have to compile them to JavaScript.
 *
 * See https://docs.expo.dev/config-plugins/plugins/#add-typescript-support-and-convert-to-dynamic-app-config
 */
import "tsx/cjs"
const getVersion = require("./scripts/get-version")

/**
 * @param config ExpoConfig coming from the static config app.json if it exists
 *
 * You can read more about Expo's Configuration Resolution Rules here:
 * https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
 */
module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? []
  const dynamicVersion = getVersion()

  return {
    ...config,
    version: dynamicVersion, // Set the Expo version
    extra: {
      ...config.extra,
      version: dynamicVersion, // Expose to app via Constants
      // Datadog configuration from environment variables
      datadog: {
        clientToken: process.env.DATADOG_CLIENT_TOKEN,
        applicationId: process.env.DATADOG_APPLICATION_ID,
        env: process.env.DATADOG_ENV || "dev",
      },
    },
    ios: {
      ...config.ios,
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
    },
    plugins: [
      ...existingPlugins,
      [
        "expo-datadog",
        {
          errorTracking: {
            iosDsyms: true,
            androidMapping: true,
          },
        },
      ],
    ],
  }
}
