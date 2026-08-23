# Deployment

## Platform: Vercel (Frontend Storefront)
## URL: https://allbirds-storefront.vercel.app
## Deploy Command: `npx vercel --prod --yes`
> Note: git push does NOT trigger auto-deploy — production updates only happen when this command is run manually (verified 2026-08-23: latest deployment was 5 days old despite daily pushes).
## Environment Variables:
- `VITE_CMS_URL`: Optional (falls back to local mock data if Payload CMS is not connected)

## Custom Domain:
- Production Alias: `https://allbirds-storefront.vercel.app`

## Rollback:
- Revert commit or promote previous deployment via Vercel dashboard.
