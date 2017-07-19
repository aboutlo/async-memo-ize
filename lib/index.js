import SimpleCache from './SimpleCache'

const toPromise = function(fn) {
  return function() {
    return new Promise((resolve, reject) => {
      const result = fn.apply(null, Array.from(arguments))
      try {
        return result.then(resolve, reject) // promise.
      } catch (e) {
        if (e instanceof TypeError) {
          resolve(result) // resolve naked value.
        } else {
          reject(e) // pass unhandled exception to caller.
        }
      }
    })
  }
}

const isPromise = p => typeof p.then === 'function'

function variadic(fn, cache) {
  const args = Array.prototype.slice.call(arguments, 2)
  const cacheKey = JSON.stringify([fn.name].concat(args))
  const promise = isPromise(fn) ? fn : toPromise(fn)
  console.log('cacheKey:', cacheKey)
  return cache.has(cacheKey).then(exist => {
    if (!exist) {
      return promise.apply(this, args).then(computedValue => {
        console.log('cache setting...')
        return cache.set(cacheKey, computedValue).then(() => {
          console.log('cache set', computedValue)
          return Promise.resolve(computedValue)
        })
      })
    }
    console.log('cache hit')
    return cache.get(cacheKey)
  })
}

module.exports = (fn, cache) => {
  const cacheClient = cache || new SimpleCache()
  return variadic.bind(this, fn, cacheClient)
}
