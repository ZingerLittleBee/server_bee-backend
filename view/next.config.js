/** @type {import('next').NextConfig} */
const nextConfig = {
    // TODO: dev
    // output: 'export',
    images: {unoptimized: true},
    async rewrites() {
        return [{
            source: '/:path*',
            destination: 'http://127.0.0.1:9527/:path*'
        }]
    }
}

module.exports = nextConfig
