# Browser-only deployment (no software installation)

This package can be deployed from a company PC using only a web browser.

## Step 1 — Put the project on GitHub
1. Sign in to https://github.com/ in your browser.
2. Click **New repository**.
3. Repository name: `production-workbench`.
4. Choose **Private** unless your company explicitly wants it public.
5. Create the repository without adding a README/license/gitignore.
6. Open the new repository and choose **Add file → Upload files**.
7. Drag the **contents** of this extracted folder into the upload area. The repository root must contain `package.json`, `server.js`, and `render.yaml`.
8. Commit the upload.

## Step 2 — Deploy on Render
1. Sign in to https://render.com/ with a browser.
2. Choose **New → Blueprint**.
3. Connect GitHub and select the `production-workbench` repository.
4. Render will detect `render.yaml`.
5. Create/deploy the service.
6. When deployment is healthy, Render gives you a public HTTPS URL such as `https://production-workbench-xxxx.onrender.com`.

## Step 3 — Test
Open the Render URL in the browser.

Useful pages:
- Monitor: `/`
- Routing: `/?page=routing`
- Component: `/?page=component`
- Mail: `/?page=workbench`
- Chat: `/?page=chat`
- Health check: `/health`

## Important V1 limitation
This V1 uses JSON files inside the cloud container for temporary demo/workbench state. On a free/ephemeral cloud service, those writes can be lost after a restart or redeploy. Use V1 to verify the UI and cloud hosting only.

Before production use, migrate persistent state to PostgreSQL/Supabase and connect the live Google Sheets/Gmail adapters.
