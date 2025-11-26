[🏠 Home](./README.md) | [⚙️ Setup](./DATADOG_SETUP.md) | [🔑 Env](./ENV_SETUP.md) | [👤 Users](./USER_TRACKING_IMPLEMENTATION.md) | [📊 Custom](./CUSTOM_TRACKING.md) | [⏱️ Timing](./COMPONENT_TIMING.md)

# Environment Variables Setup

## Overview
The Datadog credentials have been moved from hardcoded values to environment variables for better security.

## Setup Instructions

### 1. Create `.env` File
Create a file named `.env` in the root of your project with the following content:

```bash
# Datadog Configuration
DATADOG_CLIENT_TOKEN=pub1be9020eb9c7eb8b998d0948f902fe2c
DATADOG_APPLICATION_ID=0f71dd56-3bdf-445d-9712-2a9b127a29cf
DATADOG_ENV=dev
```

### 2. Verify `.gitignore`
The `.gitignore` file has been updated to exclude `.env` files from version control:

```
# Environment variables
.env
.env.local
```

This ensures your credentials won't be committed to the repository.

### 3. Template File
A `.env.example` template file should be created in your repository with placeholder values:

```bash
# Datadog Configuration
# Get these values from your Datadog account:
# https://app.datadoghq.com/organization-settings/client-tokens
DATADOG_CLIENT_TOKEN=your_datadog_client_token_here
DATADOG_APPLICATION_ID=your_datadog_application_id_here

# Environment (dev, staging, prod)
DATADOG_ENV=dev
```

**This template file SHOULD be committed** so other developers know what environment variables they need.

## How It Works

### Configuration Flow
1. Environment variables are defined in `.env` file
2. `app.config.ts` reads these variables using `process.env`
3. Values are exposed through `expo-constants` as `Constants.expoConfig.extra.datadog`
4. `app.tsx` reads the values and passes them to Datadog SDK

### Files Modified
- **`app.config.ts`**: Added `extra.datadog` configuration that reads from `process.env`
- **`app/app.tsx`**: Removed hardcoded values, now uses `Constants.expoConfig.extra.datadog`
- **`.gitignore`**: Added `.env` and `.env.local` to prevent committing secrets

## Different Environments

You can create environment-specific files:

```bash
.env          # Default (dev)
.env.local    # Local overrides (not committed)
```

For production builds, set the environment variables in your CI/CD pipeline or build service (e.g., EAS Build secrets).

## Testing the Setup

1. Create your `.env` file with the values above
2. Restart your development server:
   ```bash
   npm start
   ```
3. The app should now use the credentials from the `.env` file
4. Check the console logs - you should see Datadog initialization messages

## For Team Members

When a new developer clones the repository:

1. Copy `.env.example` to `.env`
2. Replace the placeholder values with actual Datadog credentials
3. Run `npm start`

## Security Best Practices

✅ **DO:**
- Keep `.env` in `.gitignore`
- Share credentials securely (password manager, secure chat)
- Use different credentials for dev/staging/prod
- Rotate credentials periodically

❌ **DON'T:**
- Commit `.env` files to git
- Share credentials in public channels
- Use production credentials in development
- Hardcode credentials in source code

## Troubleshooting

### "Cannot read property 'clientToken' of undefined"
- Ensure `.env` file exists in the project root
- Restart the Metro bundler after creating `.env`
- Verify environment variable names match exactly

### Changes to `.env` not reflecting
- Stop and restart the development server
- Clear Metro cache: `npm start -- --reset-cache`

