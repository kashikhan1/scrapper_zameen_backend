'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE MATERIALIZED VIEW RankedPropertiesForSale AS
        WITH RankedProperties AS (
        SELECT
            p.*,
            ROW_NUMBER() OVER (PARTITION BY p.location_id ORDER BY p.price ASC, p.area DESC, p.bath DESC, p.bedroom DESC) AS rank
        FROM properties p
        WHERE p.purpose = 'for_sale'
        )
        SELECT
        rp.*,
        l.name AS location
        FROM RankedProperties rp
        JOIN locations l ON l.id = rp.location_id
        WHERE rp.rank <= 3;
    `);

    await queryInterface.sequelize.query(`
        CREATE MATERIALIZED VIEW RankedPropertiesForRent AS
        WITH RankedProperties AS (
        SELECT
            p.*,
            ROW_NUMBER() OVER (PARTITION BY p.location_id ORDER BY p.price ASC, p.area DESC, p.bath DESC, p.bedroom DESC) AS rank
        FROM properties p
        WHERE p.purpose = 'for_rent'
        )
        SELECT
        rp.*,
        l.name AS location
        FROM RankedProperties rp
        JOIN locations l ON l.id = rp.location_id
        WHERE rp.rank <= 3;
    `);
  },
  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
        DROP VIEW RankedPropertiesForRent IF EXISTS;
    `);
    await queryInterface.sequelize.query(`
        DROP VIEW RankedPropertiesForSale IF EXISTS;
    `);
  },
};
