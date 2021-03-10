module.exports = {
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/d',
        destination: '/dashboard'
      },
      {
        source: '/d/:id/p',
        destination: '/dashboard/:id/player'
      }
    ]
  }
}