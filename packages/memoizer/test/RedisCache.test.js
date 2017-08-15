import redis from 'redis'
import {RedisCache, LocalCache} from '../lib'

describe('RedisCache', () => {
  let subject
  let key = 'k'

  beforeEach(() => {
    subject = new RedisCache()
  })

  afterEach(async () => {
    await subject.del(key)
    subject = undefined
    return true
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
        localCache: new LocalCache()
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

    it('create with localCache', () => {
      const instance = new RedisCache(new LocalCache())
      expect(instance).to.be.instanceOf(RedisCache)
      expect(instance.client).to.be.instanceOf(redis.RedisClient)
      expect(instance.localCache).to.be.instanceOf(LocalCache)
    })

    it('create with localCache and redis port and host', () => {
      const instance = new RedisCache(6379, 'localhost', new LocalCache())
      expect(instance).to.be.instanceOf(RedisCache)
      expect(instance.client).to.be.instanceOf(redis.RedisClient)
      expect(instance.localCache).to.be.instanceOf(LocalCache)
    })

  })

  describe('set', () => {
    it('a value', async () => {
      const value = 'v'
      expect(await subject.set(key, value)).to.be.equals(value)
    })
  })

  describe('has', () => {
    it('a value', async () => {
      const value = 'v'
      await subject.set(key, value)
      const boolean = await subject.has(key)
      expect(boolean).to.be.true
    })

    it('not value', async () => {
      const boolean = await subject.has(key)
      expect(boolean).to.be.false
    })
  })

  describe('get', () => {
    it('a string', async () => {
      const value = 'v'
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).equals(value)
    })

    it('a number', async () => {
      const value = 1
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).equals(value)
    })

    it('a boolean', async () => {
      const value = true
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).equals(value)
    })

    it('a date', async () => {
      const value = new Date()
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).to.be.deep.equals(value)
    })

    it('an array [1,2,"ciao"]', async () => {
      const value = [1,2,'ciao']
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).to.be.deep.equals(value)
    })

    it('an array with date [1,2,new Date()]', async () => {
      const value = [1,2,new Date('2017-10-11')]
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).to.be.deep.equals(value)
    })

    it('an object', async () => {
      const value = { foo: 'bar', value: true, tot: 1}
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).to.be.deep.equals(value)
    })

    it('a nested object', async () => {
      const value = { foo: 'bar', value: true, tot: 1, deep: { a: 'b', now: new Date()}}
      await subject.set(key, value)
      const v = await subject.get(key)
      expect(v).to.be.deep.equals(value)
    })

    it('a missing value', async () => {
      const v = await subject.get('key')
      expect(v).equals(undefined)
    })
  })

  describe('del', () => {

  })
})
