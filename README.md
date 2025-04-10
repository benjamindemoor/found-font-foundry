# Found Fonts Foundry

A growing collection of fonts discovered on the street, in the wild and everywhere in between.

## Project Overview

Found Fonts Foundry is a curated collection of typographic specimens found in the real world. The project uses [Are.na](https://www.are.na/benjamin-ikoma/found-fonts-foundry) as a content management system and displays the images in a responsive gallery.

## Technologies Used

- Next.js 15+
- React
- Tailwind CSS
- Are.na API

## Development

To run the development server:

```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

### Deploying to Vercel (recommended)

The easiest way to deploy this Next.js application is using Vercel:

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Deploying to other platforms

This application can also be deployed to:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Any hosting service that supports Next.js applications

## API Usage

This project uses the Are.na API to fetch content from the [Found Fonts Foundry](https://www.are.na/benjamin-ikoma/found-fonts-foundry) channel.

## Contributing

To contribute to this project:

1. Add your font discoveries to the [Are.na channel](https://www.are.na/benjamin-ikoma/found-fonts-foundry)
2. For code contributions, please submit a pull request

## License

This project is maintained by [Benjamin Ikoma](http://benjaminikoma.be/).

## About

Found Fonts Foundry is a curated collection of fonts spotted in the real world. This project showcases these found typographic specimens and allows others to contribute their discoveries via Are.na.

## Features

- Responsive layout with alternating image positions
- Random offset system for visually interesting layout
- Integration with Are.na API for content management
- Clean, minimalist design focused on typography
- Built with Next.js and Alte Haas Grotesk font

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/benjamindemoor/found-fonts-foundry.git
cd found-fonts-foundry
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- Next.js 15.2+
- React 18+
- TypeScript
- Tailwind CSS
- Axios for API requests

## Project Structure

- `/src/app` - Main application code
- `/public/fonts` - Font files
- `/public` - Static assets

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
