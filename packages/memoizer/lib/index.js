import {LocalCache} from './LocalCache'
import {RedisCache} from './RedisCache'

export {
  RedisCache,
  LocalCache,
}

const toPromise = function(fn) {
  return function() {
    const args = Array.from(arguments)
    return new Promise((resolve, reject) => {
      try{
        return resolve(fn.apply(null, args))
      }catch(e) {
        return reject(e)
      }
    })
  }
}

const isPromise = p => typeof p.then === 'function'
const isPrimitive = arg => arg === null || arg === undefined || (typeof arg !== 'function' && typeof arg !== 'object')

function getKey(fn, params) {
  switch (params.length) {
    case 0:
      return fn.name
    case 1:
      const arg = params[0]
      return isPrimitive(arg)? `${fn.name},${arg}` : JSON.stringify([fn.name].concat(params))
    default:
      return JSON.stringify([fn.name].concat(params))
  }
}

const memoizer = async (...args) => {
  // TODO throw an error or warning if anonymous function is passed aka fn.name === ''
  const [fn, cache] = args
  const params = args.splice(2)
  const key = getKey(fn, params)
  const promise = isPromise(fn) ? fn : toPromise(fn)
  // console.log('cacheKey:', key)
  // TODO check if promise is pending (sync)
  const exist = await cache.has(key)
  if (!exist ) {
    const computedValue = await promise.apply(undefined, params)
    await cache.set(key, computedValue)
    return computedValue
  }
  // console.log('cache hit')
  return cache.get(key)
}

export default (fn, cache) => {
  if (fn.name === '') throw new Error('Anonymous functions are not supported')
  const cacheClient = cache || new LocalCache()
  return memoizer.bind(this, fn, cacheClient)
}
