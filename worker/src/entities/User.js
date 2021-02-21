module.exports = {
  name: 'User',
  tableName: 'riptide_users',
  columns: {
    id: {
      name: 'id',
      primary: true,
      type: 'text'
    },
    saved: {
      name: 'saved',
      type: 'jsonb',
      default: {}
    }
  }
};