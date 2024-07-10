import { Service } from 'typedi';
import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';
import { CACHE_EXPIRY_SECONDS } from '@/config/index';

@Service()
export class RedisService {
  private redisClient: RedisClientType;
  constructor() {
    this.redisClient = createClient({ url: 'redis://redis:6379' });
    this.redisClient.on('error', err => {
      logger.error('Redis Client Error', err);
    });
    this.redisClient
      .connect()
      .then(() => {
        logger.info('Connected to redis');
      })
      .catch(err => {
        logger.error('Error connecting to redis: ', err);
      });
  }
  public getRedisClient(): RedisClientType {
    return this.redisClient;
  }

  public setRedisValue({ key, value }: { key: string; value: string }) {
    return this.redisClient.setEx(key, CACHE_EXPIRY_SECONDS, value);
  }

  public getRedisValue(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
}
