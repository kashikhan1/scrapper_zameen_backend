'use strict';
const { TABLE_NAME: LOCATIONS_TABLE } = require('./20240714103816-locations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trgm_name ON ${LOCATIONS_TABLE} USING gin (name gin_trgm_ops);
    `);
  },

  async down(_queryInterface, _Sequelize) {
    // when we drop table, its all indexes are also dropped
  },
};
