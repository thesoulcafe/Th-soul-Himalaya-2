# Project Deployment Rules

## AWS Amplify Deployment
### Manual Deployment (ZIP Upload)
If you are manually zipping your project to upload to AWS Amplify:
1.  Run `npm run build` locally.
2.  Open the resulting `dist` folder.
3.  Select all files *inside* `dist` and zip them directly.
4.  **Important:** The `index.html` file (from the build output) MUST be at the root of the ZIP. Do not zip the `dist` folder itself or the project root.

### Managed Deployment (CI/CD)
If deploying via GitHub connection, ensure the build settings point to the `dist` directory as the artifact base.

### Rewrite Rules
You MUST configure a rewrite rule in the Amplify Console to support React Router (SPA redirects):
- **Source:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
- **Target:** `/index.html`
- **Type:** `200 (Rewrite)`
