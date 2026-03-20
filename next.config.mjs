/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Dominio personalizado de Cloudflare (CDN)
      {
        protocol: 'https',
        hostname: 'cdn.pixbae-gaming.com',
        port: '',
        pathname: '/**',
      },
      // Bucket público de Cloudflare R2 (el pathname debe ser /**, no solo /posts/**)
      {
        protocol: 'https',
        hostname: 'pub-e8d3b4b205fb43f594d31b93a69f016.r2.dev',
        port: '',
        pathname: '/**',  // ← CORREGIDO: acepta cualquier ruta del bucket
      },
      // Supabase Storage (por si se usan avatares desde Supabase)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Placeholders de desarrollo
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
