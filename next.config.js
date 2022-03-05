module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spookyswap.finance'],
  },
  exportPathMap: async function () {
    return {
      '/convert': {
        page: '/convert',
      },
      '/vote': {
        page: '/vote',
      },
      '/borrow': {
        page: '/borrow',
      },
      '/borrow/:contract': {
        page: '/borrow/[contract].tsx',
      },
    }
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/borrow',
        permanent: true,
      },
    ]
  },
}
