/**
 * Create RedisClient Class.
 */

import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.connected = true;
    this.client = createClient();

    this.client.on('error', (err) => {
      console.log(err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      // console.log('connected');
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const value = await (promisify(this.client.GET).bind(this.client))(key);
    return value;
  }

  async set(key, value, duration) {
    await (promisify(this.client.set).bind(this.client))(key, value, 'EX', duration);
  }

  async del(key) {
    await (promisify(this.client.DEL))(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
