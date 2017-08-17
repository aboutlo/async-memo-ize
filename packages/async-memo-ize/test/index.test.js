import memoize, {LocalCache} from '../lib'

describe('memoize', function() {
  let fn
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('defined', () => {
    expect(memoize).to.be.ok
  })

  describe('async function with', function () {

    beforeEach(() => {
      fn = sandbox.spy(async () => Promise.resolve('bar'))
    })

    describe('no args', function() {
      beforeEach(() => {
        fn = sandbox.spy(async () => Promise.resolve('bar'))
      })

      it('compute a value', async () => {
        fn = async () => Promise.resolve('bar')
        const value = await memoize(fn)()
        expect(value).to.be.equals('bar')
      })

      it('return a value from the cache', async () => {
        const memoized = memoize(fn)
        await memoized()
        expect(await memoized()).to.be.equals('bar')
        expect(fn).have.been.calledOnce
      })

      it.skip('return a value from pending cache', async () => {
        const memoized = memoize(fn)
        const p1 = memoized()
        expect(memoized()).to.be.equals(p1)
        expect(fn).have.been.calledOnce
      })

      it('handle anonymous function', async () => {
        const value = await memoize(async () => 'bar', {id: 'foo'})()
        expect(value).to.be.equals('bar')
      })
    })

    describe('one arg', function() {
      const arg = 'foo'

      beforeEach(() => {
        fn = sandbox.spy(async arg => Promise.resolve(arg))
      })

      it('compute a primitive value', async () => {
        const value = await memoize(fn)(arg)
        expect(value).to.be.equals('foo')
      })

      it.skip('compute a complex value (e.g. array, object)', async () => {
        const value = await memoize(fn)(arg)
        expect(value).to.be.equals('foo')
      })

      it('return a value from the cache', async () => {
        const memoized = memoize(fn)
        await memoized(arg)
        expect(await memoized(arg)).to.be.equals('foo')
        expect(fn).have.been.calledOnce
      })
    })

    describe('multiple args', function() {
      const args = ['foo', true, { foo: 'bar' }, 10]

      beforeEach(() => {
        fn = sandbox.spy(async args => Promise.resolve(42))
      })

      it('compute a value', async () => {
        const value = await memoize(fn)(args)
        expect(value).to.be.equals(42)
      })

      it('return a value from the cache', async () => {
        const memoized = memoize(fn)
        await memoized(args)
        expect(await memoized(args)).to.be.equals(42)
        expect(fn).have.been.calledOnce
      })
    })

    describe('custom cache', function() {
      const args = ['foo']
      let cache

      beforeEach(() => {
        fn = sandbox.spy(async args => Promise.resolve(42))
        cache = new LocalCache()
      })

      it('compute a value', async () => {
        const value = await memoize(fn, {cache})(args)
        expect(value).to.be.equals(42)
        expect(await cache.size()).to.be.equals(1)
      })

      it('return a value from the cache', async () => {
        const memoized = memoize(fn, {cache})
        await memoized(args)
        expect(await memoized(args)).to.be.equals(42)
        expect(fn).have.been.calledOnce
        expect(await cache.size()).to.be.equals(1)
      })
    })

  })

  describe('sync function with', function() {

    beforeEach(() => {
      fn = sandbox.spy(() => 'bar')
    })

    describe('no args', function() {

      it('compute a value', async () => {
        const value = await memoize(fn)()
        expect(value).to.be.equals('bar')
      })

      it('return a value from the cache', async () => {
        const memoized = memoize(fn)
        await memoized()
        expect(await memoized()).to.be.equals('bar')
        expect(fn).have.been.calledOnce
      })
    })

  })

  describe('callback function with', function() {

    let callback

    beforeEach(() => {
      callback = sandbox.spy()
      fn = sandbox.spy((callback) => callback())
    })

    describe('no args', function() {

      it('calls the callback', async () => {
        await memoize(fn)(callback)
        expect(callback).have.been.calledOnce
      })

    })

  })


})
