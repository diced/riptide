module.exports = {
  name: 'User',
  tableName: 'riptide_users',
  columns: {
    id: {
      name: 'id',
      primary: true,
      type: 'text'
    },
    queues: {
      name: 'queues',
      type: 'jsonb',
      default: {}
    }
  }
};