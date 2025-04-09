# Deploying Found Font Foundry with Netlify CLI

This guide will help you deploy your Found Font Foundry website to Netlify and connect it to the foundfontfoundry.org domain using the command line.

## 1. Login to Netlify

```bash
netlify login
```

Follow the browser prompt to authorize Netlify CLI.

## 2. Initialize your site

From your project directory, run:

```bash
netlify init
```

Follow the prompts:
- Choose "Create & configure a new site"
- Select your team
- Enter a site name (or leave blank for a random name)
- Choose a site name like "found-font-foundry"

## 3. Configure build settings

When prompted about build settings:
- Build command: `npm run build`
- Directory to deploy: `.next`
- No env vars needed for now
- No functions or environment deploy

## 4. Deploy your site

```bash
netlify deploy --prod
```

Once deployed, Netlify will provide a URL like: https://found-font-foundry.netlify.app

## 5. Purchase the domain

1. Go to a domain registrar (Namecheap, GoDaddy, etc.)
2. Purchase foundfontfoundry.org
3. Complete the registration process

## 6. Connect your custom domain

```bash
netlify domains:add foundfontfoundry.org
```

## 7. Set up DNS (Option 1: Netlify DNS - Recommended)

```bash
netlify dns:add foundfontfoundry.org
```

Follow the prompts to set up Netlify DNS. Write down the nameservers provided.

Go to your domain registrar and update the nameservers to the ones provided by Netlify.

## 8. Set up DNS (Option 2: External DNS)

If you prefer to use your existing DNS provider:

1. Go to your Netlify site settings → Domain management
2. Find the "External DNS" instructions
3. Add the provided A and CNAME records at your DNS provider

## 9. Configure HTTPS

Netlify will automatically provision an SSL certificate once DNS is properly configured. To check status:

```bash
netlify site:info
```

## 10. Push future updates

For future updates, just run:

```bash
git add .
git commit -m "Your update message"
netlify deploy --prod
```

## Troubleshooting

If you encounter any issues:

1. Check your site status:
```bash
netlify status
```

2. View your site's details:
```bash
netlify site:info
```

3. Open the Netlify admin UI:
```bash
netlify open
```

4. Check DNS propagation (can take up to 48 hours):
```bash
netlify dns:check foundfontfoundry.org
```

Good luck with your deployment! 