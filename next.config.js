module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/migration',
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
        destination: 'https://app.deus.finance/xdeus/swap',
        permanent: false,
      },
      // {
      //   source: '/vdeus/new',
      //   destination: 'https://app.deus.finance/xdeus/swap',
      //   permanent: false,
      // },
      // {
      //   source: '/vdeus/legacy',
      //   destination: 'https://app.deus.finance/xdeus/swap',
      //   permanent: false,
      // },
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
