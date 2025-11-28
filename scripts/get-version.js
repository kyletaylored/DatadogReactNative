const { execSync } = require("child_process")

const packageJson = require("../package.json")

function getVersion() {
  try {
    // 1. Try to get the latest git tag
    // 2>/dev/null suppresses errors if no tags exist
    const gitTag = execSync("git describe --tags --abbrev=0 2>/dev/null").toString().trim()
    // Strip leading 'v' if present to ensure clean version number (e.g. v1.0.0 -> 1.0.0)
    if (gitTag) return gitTag.replace(/^v/, "")
  } catch (e) {
    // No tags found
  }

  try {
    // 2. Fallback to package version + short git hash
    const gitHash = execSync("git rev-parse --short HEAD").toString().trim()
    return `${packageJson.version}-${gitHash}`
  } catch (e) {
    // 3. Fallback to just package version
    return packageJson.version
  }
}

// If run directly, print to stdout
if (require.main === module) {
  console.log(getVersion())
}

module.exports = getVersion
