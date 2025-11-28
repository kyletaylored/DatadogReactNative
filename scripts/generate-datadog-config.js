const fs = require("fs")
const path = require("path")

const getVersion = require("./get-version")

// Parse arguments
const args = process.argv.slice(2)
const platformArgIndex = args.indexOf("--platform")
const platform = platformArgIndex !== -1 ? args[platformArgIndex + 1] : null

// Try to load .env file manually
const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8")
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["'](.*)["']$/, "$1") // Remove quotes
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

// Determine Mobile App ID based on platform
let mobileApplicationId = process.env.DATADOG_SYNTHETICS_MOBILE_APPLICATION_ID // Default fallback

if (platform === "ios") {
  mobileApplicationId = process.env.DATADOG_IOS_APP_ID || mobileApplicationId
} else if (platform === "android") {
  mobileApplicationId = process.env.DATADOG_ANDROID_APP_ID || mobileApplicationId
}

// Map env vars to Datadog config keys
const config = {
  apiKey: process.env.DD_API_KEY || process.env.DATADOG_API_KEY,
  appKey: process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY,
  datadogSite: process.env.DATADOG_SITE || "datadoghq.com",
  mobileApplicationId: mobileApplicationId,
  versionName: getVersion(),
}

// Filter out undefined values
Object.keys(config).forEach((key) => config[key] === undefined && delete config[key])

if (!config.apiKey || !config.appKey) {
  console.warn("⚠️  Warning: Datadog API/App keys not found in environment variables or .env file.")
}

if (!config.mobileApplicationId) {
  console.warn(
    "⚠️  Warning: Mobile Application ID not found. Upload might require it as a CLI argument.",
  )
}

const outputPath = path.resolve(__dirname, "../datadog-ci.json")
fs.writeFileSync(outputPath, JSON.stringify(config, null, 2))

console.log(`✅ Generated ${outputPath} from environment variables.`)
