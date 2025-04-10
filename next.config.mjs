/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2w9rnfcy7mm78.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.are.na',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arena-attachments.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // This helps with Netlify deployments
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Netlify specific settings
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

export default nextConfig; 