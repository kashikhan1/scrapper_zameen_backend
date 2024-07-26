import Container from 'typedi';
import { sequelize } from '@/config/sequelize';
import { Property } from '@/models/models';
import { RedisService } from '@/services/redis.service';

export const getPropertyTypes = async () => {
  const redis = Container.get(RedisService);
  const cacheKey = `getPropertyTypes`;
  const redisValue = await redis.getRedisValue(cacheKey);
  if (redisValue) {
    return JSON.parse(redisValue);
  }
  const result = await Property.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('type')), 'type']],
  });
  const propertyTypes = result.map(item => item?.['type']).filter(item => item != null);
  redis.setRedisValue({ key: cacheKey, value: JSON.stringify(propertyTypes) });
  return propertyTypes;
};

export const getPropertyPurpose = async () => {
  const redis = Container.get(RedisService);
  const cacheKey = `getPropertyPurpose`;
  const redisValue = await redis.getRedisValue(cacheKey);
  if (redisValue) {
    return JSON.parse(redisValue);
  }
  const result = await Property.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('purpose')), 'purpose']],
  });
  const propertyPurpose = result.map(item => item?.['purpose']).filter(item => item != null);
  redis.setRedisValue({ key: cacheKey, value: JSON.stringify(propertyPurpose) });
  return propertyPurpose;
};

export const isInvalidNumber = (value: string): boolean => isNaN(Number(value)) || Number(value) < 0;
