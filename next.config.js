module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/redemption',
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
