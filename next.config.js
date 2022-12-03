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
      {
        source: '/vest',
        destination: 'http://app.deus.finance/vest',
        permanent: false,
      },
      {
        source: '/vest/create',
        destination: 'http://app.deus.finance/vest/create',
        permanent: false,
      },
      {
        source: '/rewards',
        destination: 'http://app.deus.finance/vest',
        permanent: false,
      },
    ]
  },
}
