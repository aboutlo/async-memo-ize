import {SimpleCache} from './SimpleCache'
import {RedisCache} from './RedisCache'

export {
  RedisCache,
  SimpleCache,
}

// function (err, res) {}
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
const pending = Object.create(null)

const isPromise = p => typeof p.then === 'function'
const isPrimitive = arg => arg === null || arg === undefined || (typeof arg !== 'function' && typeof arg !== 'object')

function getKey(fn, params) {
  // console.log('params:', params.length)
  switch (params.length) {
    case 0:
      return fn.name
    case 1:
      const arg = params[0]
        // return `${fn.name},${arg}`
      return isPrimitive(arg)? `${fn.name},${arg}` : JSON.stringify([fn.name].concat(params))
    default:
      return JSON.stringify([fn.name].concat(params))
  }
}

function memoizer(...args) {
  // TODO throw an error or warning if anonymous function is passed aka fn.name === ''
  const [fn, cache] = args
  const params = args.splice(2)
  const key = getKey(fn, params)
  const promise = isPromise(fn) ? fn : toPromise(fn)
  // console.log('cacheKey:', key)
  // if (pending[key]) return pending[key]
  // pending[key] = promise
  return cache.has(key).then(exist => {
    if (!exist ) {
      return promise.apply(this, params).then(computedValue => {
        // console.log('cache setting...')
        // pending[key] = undefined
        return cache.set(key, computedValue).then(() => {
          // console.log('cache set', computedValue)
          return Promise.resolve(computedValue)
        })
      })
    }
    // console.log('cache hit')
    return cache.get(key)
  })
}

export default (fn, cache) => {
  const cacheClient = cache || new SimpleCache()
  return memoizer.bind(this, fn, cacheClient)
}
