import redis from 'redis'
import bluebird from 'bluebird'
bluebird.promisifyAll(redis.Multi.prototype)
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const EXPIRATION = 3600 // seconds

class RedisCache {
  constructor(options) {
    this.client = redis.createClient(options)
  }

  async has(key) {
    return this.client.existsAsync(key).then(reply => {
      console.log('has:', reply)
      return reply === 1
    })
  }

  async get(key) {
    return this.client.getAsync(key).then(value => value === null ? undefined : value)
  }

  async set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.setAsync(key, value, 'EX', EXPIRATION).then(status => {
        status === 'OK' ? resolve(value) : reject(status)
      })
    })
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      return resolve(this.client.delete(key))
    })
  }

  async entries() {
    return new Promise((resolve, reject) => {
      return resolve(this.client.entries())
    })
  }

  async size() {
    return new Promise((resolve, reject) => {
      return resolve(this.client.size)
    })
  }
}

export default RedisCache
