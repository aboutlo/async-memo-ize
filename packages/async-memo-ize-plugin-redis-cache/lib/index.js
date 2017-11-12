import redis from 'redis'
import { LocalCache } from 'async-memo-ize'

// only the second arg is serialized
const valueSerializer = (arg, i) => (i === 1 ? JSON.stringify(arg) : arg)
const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{2,}Z$/

const reviver = (key, value) => {
  if (typeof value === 'string' && dateFormat.test(value)) {
    return new Date(value)
  }
  return value
}
const omit = (obj, props) =>
  Object.entries(obj)
    .filter(([key]) => !props.includes(key))
    .reduce((memo, [key, val]) => Object.assign(memo, { [key]: val }), {})

/**
 * new RedisCache()
 * new RedisCache(6379, 'localhost')
 * new RedisCache({
 *    host: 'localhost',
 *    port: 6379,
 * })
 * new RedisCache(redisClient)
 * new RedisCache(new LocalCache())

 * new RedisCache(6379, 'localhost', new LocalCache())
 * new RedisCache({
 *    host: 'localhost',
 *    port: 6379,
 *    localCache: new LocalCache()
 * })
 * */

class RedisCache {
  constructor() {
    const args = Array.from(arguments)
    if (args[0] instanceof redis.RedisClient) {
      this.client = args[0]
      this.localCache = new LocalCache()
    } else if (args[0] instanceof LocalCache) {
      this.localCache = args[0]
      this.client = redis.createClient.apply(redis, args.splice(1))
    } else if (
      args[0] instanceof Object &&
      !args[0] instanceof redis.RedisClient &&
      args.length === 1
    ) {
      this.localCache = args.localCache
      const redisOptions = omit(args, ['localCache'])
      this.client = redis.createClient(redisOptions)
    } else {
      this.client = redis.createClient.apply(redis, args)
      this.localCache = new LocalCache()
    }

    this.client.on('error', function(err) {
      console.log('Error ' + err)
    })
    this.client.on('ready', function() {
      // console.log('ready')
    })
    this.client.on('connect', function() {
      // console.log('connect')
    })
    this.client.on('reconnecting', function() {
      // console.log('reconnecting')
    })

    this.client.on('end', function() {
      console.log('end')
    })
  }

  async has(key) {
    const has = await this.localCache.has(key)
    if (has) {
      return has
    }
    return new Promise((resolve, reject) => {
      this.client.exists(key, (err, reply) => {
        if (err) reject(err)
        return resolve(reply === 1)
      })
    })
  }

  async get(key) {
    const localValue = await this.localCache.get(key)

    if (localValue) {
      return JSON.parse(localValue, reviver)
    }
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err)
        return resolve(value === null ? undefined : JSON.parse(value, reviver))
      })
    })
  }

  // supported args https://redis.io/commands/set
  // SET key value [EX seconds] [PX milliseconds] [NX|XX]
  async set() {
    // only the second arg (value) is serialized
    const args = Array.from(arguments).map(valueSerializer)
    const [key, value] = args
    await this.localCache.set(key, value)
    return new Promise((resolve, reject) => {
      this.client.set(...args, (err, reply) => {
        if (err) return reject(err)
        return reply === 'OK'
          ? resolve(JSON.parse(value, reviver))
          : reject(status)
      })
    })
  }

  async del(key) {
    await this.localCache.del(key)
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) return reject(err)
        return resolve(reply)
      })
    })
  }

  async entries() {
    throw new Error('entries() not implemented!')
  }

  async size() {
    throw new Error('size() not implemented!')
  }
}

export default RedisCache
