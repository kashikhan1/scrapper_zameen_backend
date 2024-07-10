import { QueryTypes } from 'sequelize';
import { sequelize } from '@/config/sequelize';

export const getPropertyTypes = async () => {
  return (await sequelize.query('SELECT DISTINCT type FROM property_v2;', { type: QueryTypes.SELECT })).map(item => item?.['type']);
};

export const getPropertyPurpose = async () => {
  return (await sequelize.query<{ purpose: string }>('SELECT DISTINCT purpose FROM property_v2;', { type: QueryTypes.SELECT }))
    .map(item => item?.['purpose'])
    .filter(item => item != null);
};
