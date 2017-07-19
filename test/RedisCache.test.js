import RedisCache from '../lib/RedisCache'

describe('RedisCache', function() {
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
})
