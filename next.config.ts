import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-auth'],
  async redirects() {
    return [
      {
        source: '/aliments',
        destination: '/grains/aliments',
        permanent: true,
      },
      {
        source: '/aliments/ajouter',
        destination: '/grains/aliments/ajouter',
        permanent: true,
      },
      {
        source: '/aliments/:id',
        destination: '/grains/aliments/:id',
        permanent: true,
      },
      {
        source: '/aliments/:id/modifier',
        destination: '/grains/aliments/:id/modifier',
        permanent: true,
      },
      {
        source: '/inventaire',
        destination: '/grains/inventaire',
        permanent: true,
      },
      {
        source: '/rations',
        destination: '/grains/rations',
        permanent: true,
      },
      {
        source: '/ration',
        destination: '/grains/rations',
        permanent: true,
      },
      {
        source: '/transactions',
        destination: '/grains/transactions',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
