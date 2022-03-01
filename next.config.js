module.exports = {
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
    }
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/convert',
        permanent: true,
      },
    ]
  },
}
