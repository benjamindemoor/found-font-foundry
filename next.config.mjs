/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['d2w9rnfcy7mm78.cloudfront.net', 'are.na', 'arena-attachments.s3.amazonaws.com'],
    unoptimized: true,
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