import redis from 'redis'
import bluebird from 'bluebird'
bluebird.promisifyAll(redis.RedisClient.prototype)

class RedisCache {
  constructor() {
    const args = Array.from(arguments)
    const redisClient = args[0]
    this.client =
      redisClient instanceof redis.RedisClient
        ? redisClient
        : redis.createClient.apply(undefined, args)
    this.client.on("error", function (err) {
      console.log("Error " + err);
    });
    this.client.on("ready", function () {
      console.log("ready");
    });
    this.client.on("connect", function () {
      console.log("connect");
    });
    this.client.on("reconnecting", function () {
      console.log("reconnecting");
    });

    this.client.on("end", function () {
      console.log("end");
    });

  }

  async has(key) {
    return this.client.existsAsync(key).then(reply => {
      return reply === 1
    })
  }

  async get(key) {
    return this.client.getAsync(key).then(value => (value === null ? undefined : value))
  }

  // supported args https://redis.io/commands/set
  // SET key value [EX seconds] [PX milliseconds] [NX|XX]
  async set() {
    const args = Array.from(arguments)
    console.log('set:', args)
    const [key, value] = args
    return new Promise((resolve, reject) => {
      this.client.setAsync.apply(this.client, args).then(status => {
        console.log('status:', status)
        status === 'OK' ? resolve(value) : reject(status)
      })
    })
  }

  async del(key) {
    return this.client.deleteAsync(key)
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
