'use strict';

const TABLE_NAME = 'locations';

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
      name: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
