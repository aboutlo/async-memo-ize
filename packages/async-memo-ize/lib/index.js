import { LocalCache } from './LocalCache'

export { LocalCache }

const toPromise = function(fn) {
  return function() {
    const args = Array.from(arguments)
    return new Promise((resolve, reject) => {
      try {
        return resolve(fn.apply(null, args))
      } catch (e) {
        return reject(e)
      }
    })
  }
}

const isPromise = p => typeof p.then === 'function'
const isPrimitive = arg =>
  arg === null ||
  arg === undefined ||
  (typeof arg !== 'function' && typeof arg !== 'object')

function generateKey(id, fn, params) {
  const prefix = fn.name || id
  switch (params.length) {
    case 0:
      return prefix
    case 1:
      const arg = params[0]
      return isPrimitive(arg)
        ? `${prefix},${arg}`
        : JSON.stringify([prefix].concat(params))
    default:
      return JSON.stringify([prefix].concat(params))
  }
}

const memoizer = async (...args) => {
  const [fn, cache, id, queue] = args
  const params = args.splice(4)
  const key = generateKey(id, fn, params)
  const promise = isPromise(fn) ? fn : toPromise(fn)
  // console.log('cacheKey:', key)
  const value = await cache.get(key)
  const pending = queue.has(key)
  return new Promise(async (resolve, reject) => {
    if (!value && !pending) {
      queue.set(key, [])
      const computedValue = await promise.apply(undefined, params)

      await cache.set(key, computedValue)

      return Promise.all(
        queue.get(key).map(f => f.call(undefined, computedValue))
      )
        .then(() => queue.delete(key))
        .then(() => resolve(computedValue))
    }
    if (pending) {
      const listeners = queue.get(key)
      queue.set(key, [resolve].concat(listeners))
    }
    if (value) return resolve(value)
  })
}

export default (fn, options = {}) => {
  const { id, cache } = options
  if (fn.name === '' && !id)
    throw new Error(`
      Anonymous functions are not supported. 
      Pass an id as option to identify the function. 
      e.g. memoize(async () => 'bar', {id: 'foo'})`)
  const cacheClient = cache || new LocalCache()
  const queue = new Map()
  return memoizer.bind(this, fn, cacheClient, id, queue)
}
