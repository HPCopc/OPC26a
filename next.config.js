import { OPTIMIZED_IMAGE_HOSTS } from './lib/imageHosts.js';

const nextConfig = {
  // Add your local network IP to the allowed list
  allowedDevOrigins: ['192.168.0.102'],
  images: {
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map(hostname => ({ protocol: 'https', hostname })),
  },
}

export default nextConfig
