'use strict';

const TABLE_NAME = 'agencies';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  TABLE_NAME,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME, {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      profile_url: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE TRIGGER update_table_trigger
      BEFORE UPDATE ON ${TABLE_NAME}
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at();
    `);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
