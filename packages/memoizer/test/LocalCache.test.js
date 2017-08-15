import {LocalCache} from '../lib'

describe('LocalCache', function() {
  let subject

  beforeEach(() => {
    subject = new LocalCache()
  })

  afterEach(() => {
    subject = undefined
  })

  it('defined', () => {
    expect(LocalCache).to.be.ok
  })

  describe('constructor', () => {
    it('without args', () => {
      expect(new LocalCache()).to.be.ok
    })

    it('with max size', () => {
      expect(new LocalCache({max: 5})).to.be.ok
    })
  })

  describe('set', () => {
    it('a value', async () => {
      const value = 'v'
      const key = 'k'
      await subject.set(key, value)
      const read = await subject.get(key)
      expect(read).to.be.equals(value)

    })
  })

  describe('size', () => {
    it('returns the current cache size', async () => {
      const value = 'v'
      const key = 'k'
      await subject.set(key, value)
      expect(await subject.size()).to.be.equals(1)

    })
  })

  describe('clear', () => {
    it('remove all the entries', async () => {
      const value = 'v'
      const key = 'k'
      await subject.set(key, value)
      await subject.clear()
      expect(await subject.size()).to.be.equals(0)

    })
  })

  describe('entries', () => {
    it('returns all entries', async () => {
      await subject.set('foo', 1)
      await subject.set('bar', 2)
      const entries = [...await subject.entries()]
      expect(entries).to.be.lengthOf(2)

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
