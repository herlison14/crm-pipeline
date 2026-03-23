/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
          return [
            {
                      source: '/',
                      destination: '/pipeline',
                      permanent: false,
            },
                ]
    },
}
export default nextConfig
