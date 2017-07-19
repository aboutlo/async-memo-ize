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

  const cacheKey = JSON.stringify(args)
  // console.log('cacheKey:', cacheKey)
  const promise = isPromise(fn) ? fn : toPromise(fn)
  return cache.has(cacheKey).then(exist => {
    if (!exist) {
      return promise
        .apply(this, args)
        .then(computedValue =>
          cache.set(cacheKey, computedValue).then(() => Promise.resolve(computedValue))
        )
    }
    // console.log('hit cache')
    return cache.get(cacheKey)
  })
}

module.exports = (fn, options = {}) => {
  const cache = options.cache ? options.cache : new SimpleCache()
  console.log('fn name:', fn.name)
  return variadic.bind(this, fn, cache)
}
