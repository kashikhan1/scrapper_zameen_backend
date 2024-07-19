import { sequelize } from '@/config/sequelize';
import { DataTypes, literal } from 'sequelize';

const { TABLE_NAME: CITIES_TABLE } = require('../migrations/20240713080551-create-city');
const { TABLE_NAME: LOCATIONS_TABLE } = require('../migrations/20240714103816-locations');
const { TABLE_NAME: PROPERTIES_TABLE } = require('../migrations/20240715121921-create-properties');

export const Property = sequelize.define(
  'Property',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    header: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'agricultural_land',
        'building',
        'commercial_plot',
        'factory',
        'farm_house',
        'flat',
        'house',
        'industrial_land',
        'office',
        'other',
        'penthouse',
        'plot_file',
        'plot_form',
        'residential_plot',
        'room',
        'shop',
        'lower_portion',
        'upper_portion',
        'warehouse',
      ),
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    location_id: {
      type: DataTypes.INTEGER,
      references: {
        model: LOCATIONS_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
    bath: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    purpose: {
      type: DataTypes.ENUM('for_sale', 'for_rent'),
      allowNull: true,
    },
    bedroom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    added: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    initial_amount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    monthly_installment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remaining_installments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    cover_photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    city_id: {
      type: DataTypes.INTEGER,
      references: {
        model: CITIES_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
  },
  {
    tableName: PROPERTIES_TABLE,
    modelName: 'Property',
    timestamps: false,
    underscored: true,
  },
);

export const City = sequelize.define(
  'City',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: CITIES_TABLE,
    modelName: 'City',
    timestamps: false,
    underscored: true,
  },
);

export const Location = sequelize.define(
  'Location',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: LOCATIONS_TABLE,
    modelName: 'Location',
    timestamps: false,
    underscored: true,
  },
);
