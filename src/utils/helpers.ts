import { QueryTypes } from 'sequelize';
import { sequelize } from '@/config/sequelize';

export const getPropertyTypes = async () => {
  return (await sequelize.query('SELECT DISTINCT type FROM property_v2;', { type: QueryTypes.SELECT })).map(item => item?.['type']);
};
