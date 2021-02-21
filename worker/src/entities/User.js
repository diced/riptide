module.exports = {
  name: 'User',
  columns: {
    id: {
      primary: true,
      type: 'text'
    },
    saved: {
      type: 'jsonb',
      default: {}
    }
  }
};