module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/vdeus',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/vdeus',
        permanent: false,
      },
      {
        source: '/redemption',
        destination: '/vdeus',
        permanent: false,
      },
      {
        source: '/vdeus',
        destination: '/vdeus/new',
        permanent: false,
      },
      {
        source: '/vest',
        destination: 'http://app.deus.finance/vest',
        permanent: false,
      },
      {
        source: '/vest/create',
        destination: 'http://app.deus.finance/vest',
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
