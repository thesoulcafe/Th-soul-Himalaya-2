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

## Social Media Previews & SSR (AWS Amplify)
For social media link previews (WhatsApp, Facebook) to work dynamically, the meta tags MUST be injected server-side.

### SSR Configuration (Amplify Gen 2 / Compute)
To ensure `server.ts` handles your traffic and injects meta tags, you must configure Amplify for **SSR Hosting**:
1.  In your `amplify.yml` (Build Settings), ensure the build command includes metadata generation:
    ```yaml
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    ```
2.  **Crucial:** If you are using Amplify Static Hosting, your `server.ts` will be ignored. To fix this, you must deploy as a **Web App with SSR** or use a **CloudRun/Lambda** proxy. 
3.  **Alternative (SPA Redirects):** If you remain on Static Hosting, ensure this rewrite rule is active in the Amplify Console:
    - **Source:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
    - **Target:** `/index.html` (Note: This still won't give dynamic OG tags without a backend).

### Social Preview Debugging
- Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to force a crawl and see what tags are being picked up.
- Use [Social Share Preview](https://socialsharepreview.com/) for WhatsApp testing.
