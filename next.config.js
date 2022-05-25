module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spookyswap.finance'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/redemption',
        permanent: true,
      },
    ]
  },
}
