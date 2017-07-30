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

const isPromise = p => typeof p.then === 'function'
const isPrimitive = arg => arg === null || arg === undefined || (typeof arg !== 'function' && typeof arg !== 'object')

function memoizer(fn, cache) {
  // TODO throw an error or warning if anonymous function is passed aka fn.name === ''
  const args = Array.prototype.slice.call(arguments, 2)
  // console.log('args', args)
  let key
  switch (args.length) {
    case 0:
      key = fn.name
      break
    case 1:
      const arg = args[0]
      key = isPrimitive(arg)? `${fn.name},${arg}` : JSON.stringify([fn.name].concat(args))
      break;
    default:
      key = JSON.stringify([fn.name].concat(args))
  }
  const promise = isPromise(fn) ? fn : toPromise(fn)
  // console.log('cacheKey:', key)
  return cache.has(key).then(exist => {
    if (!exist) {
      return promise.apply(this, args).then(computedValue => {
        // console.log('cache setting...')
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
