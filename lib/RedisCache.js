import redis from 'redis'

// only the second arg is serialized
const valueSerializer = (arg, i) => i === 1 ? JSON.stringify(arg) : arg
const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{2,}Z$/;

const reviver = (key, value) => {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}


class RedisCache {
  constructor() {
    const args = Array.from(arguments)
    const redisClient = args[0]
    this.client =
      redisClient instanceof redis.RedisClient
        ? redisClient
        : redis.createClient.apply(undefined, args)
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
    return new Promise((resolve, reject) => {
      this.client.exists(key, (err, reply)=> {
        if (err) reject(err)
        return resolve(reply === 1)
      })
    })
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value)=> {
        if (err) reject(err)
        return resolve(value === null ? undefined : JSON.parse(value, reviver))
      })
    })
  }

  // supported args https://redis.io/commands/set
  // SET key value [EX seconds] [PX milliseconds] [NX|XX]
  async set() {
    const args = Array.from(arguments).map(valueSerializer)
    const [key, value] = args
    return new Promise((resolve, reject) => {
      this.client.set(...args, (err, reply) => {
        if (err) return reject(err)
        return reply === 'OK' ? resolve(JSON.parse(value, reviver)) : reject(status)
      })
    })
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) return reject(err)
        return resolve(reply)
      } )
    })
  }

  async entries() {
    throw new Error('entries() not implemented!')
  }

  async size() {
    throw new Error('size() not implemented!')
  }
}

export { RedisCache }
