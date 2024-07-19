'use strict';
const { TABLE_NAME: PROPERTIES_TABLE } = require('./20240715121921-create-properties');
const { TABLE_NAME: CITIES_TABLE } = require('./20240713080551-create-city');
const { TABLE_NAME: LOCATIONS_TABLE } = require('./20240714103816-locations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE TRIGGER update_table_trigger
      BEFORE UPDATE ON ${PROPERTIES_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at();
    `);
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE TRIGGER update_table_trigger
      BEFORE UPDATE ON ${CITIES_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at();
    `);
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE TRIGGER update_table_trigger
      BEFORE UPDATE ON ${LOCATIONS_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at();
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_table_trigger ON ${PROPERTIES_TABLE};
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_table_trigger ON ${CITIES_TABLE};
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_table_trigger ON ${LOCATIONS_TABLE};
    `);
  },
};
