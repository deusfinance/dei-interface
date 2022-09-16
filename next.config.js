module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/redemption',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/vdeus',
        destination: '/vdeus/new',
        permanent: true,
      },
    ]
  },
}
