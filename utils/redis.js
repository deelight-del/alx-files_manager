/**
 * Create RedisClient Class.
 */

import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.connected = true;
    this.client = createClient();

    this.client.on('error', () => {
      // console.log(err);
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
    if (!this.isAlive()) { return undefined; }
    const value = await (promisify(this.client.GET).bind(this.client))(key);
    return value;
  }

  async set(key, value, duration) {
    if (!this.isAlive()) { return; }
    await (promisify(this.client.set).bind(this.client))(key, value, 'EX', duration);
  }

  async del(key) {
    if (!this.isAlive()) { return; }
    await (promisify(this.client.DEL).bind(this.client))(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
