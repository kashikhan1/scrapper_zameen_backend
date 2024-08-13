'use strict';
const { TABLE_NAME: PROPERTIES_TABLE } = require('./20240715121921-create-properties');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(PROPERTIES_TABLE, 'is_posted_by_agency', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn(PROPERTIES_TABLE, 'is_posted_by_agency');
  },
};
