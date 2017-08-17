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
  arg === null || arg === undefined || (typeof arg !== 'function' && typeof arg !== 'object')

function generateKey(id, fn, params) {
  const prefix = fn.name || id
  switch (params.length) {
    case 0:
      return prefix
    case 1:
      const arg = params[0]
      return isPrimitive(arg) ? `${prefix},${arg}` : JSON.stringify([prefix].concat(params))
    default:
      return JSON.stringify([prefix].concat(params))
  }
}

const memoizer = async (...args) => {
  const [fn, cache, id] = args
  const params = args.splice(3)
  const key = generateKey(id, fn, params)
  console.log('key:', key)
  const promise = isPromise(fn) ? fn : toPromise(fn)
  // console.log('cacheKey:', key)
  // TODO check if promise is pending (sync)
  const exist = await cache.has(key)
  if (!exist) {
    const computedValue = await promise.apply(undefined, params)
    await cache.set(key, computedValue)
    return computedValue
  }
  // console.log('cache hit')
  return cache.get(key)
}

export default (fn, options = {}) => {
  const {id, cache} = options
  if (fn.name === '' && !id) throw new Error(`Anonymous functions are not supported. Pass an id as option to identify the function. e.g. memoize(async () => 'bar', {id: 'foo'})`)
  const cacheClient = cache || new LocalCache()
  return memoizer.bind(this, fn, cacheClient, id)
}
