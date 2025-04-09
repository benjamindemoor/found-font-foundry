# Deploying Found Font Foundry to Netlify with foundfontfoundry.org

## 1. Push your code to GitHub

First, create a repository on GitHub and push your code:

1. Go to https://github.com/new
2. Create a new repository named "found-font-foundry"
3. Push your code (from the GITHUB_PUSH_INSTRUCTIONS.md file)

## 2. Sign up for Netlify

1. Go to [Netlify](https://app.netlify.com/signup) and sign up for an account
2. Choose to sign up with GitHub to connect your GitHub account

## 3. Create a new site from Git

1. Click "New site from Git" on your Netlify dashboard
2. Select GitHub as your Git provider
3. Authorize Netlify if prompted
4. Select your "found-font-foundry" repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

## 4. Purchase the foundfontfoundry.org domain

1. Go to a domain registrar (like Namecheap, GoDaddy, or Google Domains)
2. Search for "foundfontfoundry.org" and purchase it
3. Complete the registration process

## 5. Connect your custom domain in Netlify

1. In your Netlify site dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter "foundfontfoundry.org" and click "Verify"
4. Click "Add domain"

## 6. Configure DNS settings

### Option A: Use Netlify DNS (Recommended)

1. In your Netlify site's Domain settings, click "Set up Netlify DNS" for your custom domain
2. Follow the instructions to add the custom nameservers to your domain registrar
3. Wait for DNS propagation (up to 48 hours)

### Option B: Keep your current DNS provider

1. Go to your domain registrar's DNS settings
2. Add the following DNS records:
   - A record: @ pointing to Netlify's load balancer IP (provided in Netlify's instructions)
   - CNAME record: www pointing to your Netlify site URL (yoursite.netlify.app)

## 7. Configure HTTPS

1. After DNS is propagated, Netlify will automatically provision an SSL certificate
2. In your site's Domain settings, ensure "HTTPS" is enabled
3. Select "Let's Encrypt certificate"

## 8. Finalize and test

1. Wait for DNS propagation and SSL certificate issuance (up to 48 hours)
2. Visit https://foundfontfoundry.org to confirm your site is working correctly
3. Test on mobile devices and different browsers

## Troubleshooting

- If your site doesn't load after DNS propagation, check the Netlify deploy logs
- For SSL issues, try forcing HTTPS renewal in the Netlify dashboard
- For build errors, check your site's deploy logs in Netlify

## Maintenance

- Future updates: Just push to your GitHub repository, and Netlify will automatically rebuild and deploy your site 