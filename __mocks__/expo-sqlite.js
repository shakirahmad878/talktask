module.exports = {
  openDatabaseSync: () => ({
    execSync: () => {},
    withTransactionSync: (cb) => cb(),
    runSync: () => ({ changes: 1, lastInsertRowId: 1 }),
    getAllSync: () => [],
    getFirstSync: () => null,
  }),
  openDatabaseAsync: async () => ({
    execAsync: async () => {},
    withTransactionAsync: async (cb) => cb(),
    runAsync: async () => ({ changes: 1, lastInsertRowId: 1 }),
    getAllAsync: async () => [],
    getFirstAsync: async () => null,
  }),
};
