import rateLimit from '@config/rateLimit';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from 'redis';
import redisMock from 'redis-mock';

import ICacheProvider from '../contracts/IRateLimiterProvider';

class RateLimiterProvider implements ICacheProvider {
  private limiter: RateLimiterRedis;

  constructor() {
    let redisClient: redis.RedisClient;

    if (process.env.NODE_ENV !== 'test') {
      redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      });
    } else {
      redisClient = redisMock.createClient();
    }

    this.limiter = new RateLimiterRedis({
      storeClient: redisClient,
      ...rateLimit,
    });
  }

  async consume(ip: string): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      await this.limiter.consume(ip);
    }
  }
}

export default RateLimiterProvider;
