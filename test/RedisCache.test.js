import redis from 'redis'
import bluebird from 'bluebird'
bluebird.promisifyAll(redis.RedisClient.prototype)
import {RedisCache} from '../lib'

describe('RedisCache', () => {
  let subject

  beforeEach(() => {
    subject = new RedisCache()
  })

  afterEach(() => {
    subject = undefined
  })

  it('defined', () => {
    expect(RedisCache).to.be.ok
  })

  describe('constructor', () => {

    it('create without options', () => {
      const instance = new RedisCache()
      expect(instance).to.be.instanceOf(RedisCache)
      expect(instance.client).to.be.instanceOf(redis.RedisClient)
    })

    it('create with redis params', () => {
      const instance = new RedisCache(6379, 'localhost')
      expect(instance).to.be.instanceOf(RedisCache)
      expect(instance.client).to.be.instanceOf(redis.RedisClient)
    })

    it('create with redis options', () => {
      const instance = new RedisCache({
        host: 'localhost',
        port: 6379,
      })
      expect(instance).to.be.instanceOf(RedisCache)
      expect(instance.client).to.be.instanceOf(redis.RedisClient)
    })

    it('create with redis client', () => {
      const client = redis.createClient()
      const instance = new RedisCache(client)
      expect(instance).to.be.instanceOf(RedisCache)
      expect(instance.client).to.be.instanceOf(redis.RedisClient)
    })

  })

  describe('set', () => {
    it('a value', async () => {
      const value = 'v'
      const key = 'k'
      expect(await subject.set(key, value)).to.be.equals(value)
    })
  })

  describe('has', () => {
    it('a value', async () => {
      const value = 'v'
      const key = 'k'
      await subject.set(key, value)
      const boolean = await subject.has(key)
      expect(boolean).to.be.true
    })

    it('not value', async () => {
      const boolean = await subject.has('key')
      expect(boolean).to.be.false
    })
  })

  describe('get', () => {
    it('an existing value', async () => {
      const value = 'v'
      const key = 'k'
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).equals(value)
    })

    it('a missing value', async () => {
      const v = await subject.get('key')
      expect(v).equals(undefined)
    })
  })

  describe('del', () => {

  })
})
