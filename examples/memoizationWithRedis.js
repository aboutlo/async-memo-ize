import redis from 'redis'

import memoize, { RedisCache } from '../lib'

const whatsTheAnswerToLifeTheUniverseAndEverything = async (a, b, c) =>
  new Promise(resolve => {
    setTimeout(function() {
      console.log('done with redis')
      resolve([1, 21, 20].reduce((memo, current) => memo + current, 0))
    }, 2000)
  })

const example = async () => {
  const cache = new RedisCache()
  const memoized = memoize(whatsTheAnswerToLifeTheUniverseAndEverything, cache)
  // first call
  console.time('compute first')
  console.log('doSomething:', await memoized('foo', 3, 'bar'))
  console.timeEnd('compute first')

  // next 100 calls
  return Promise.all(
    Array.from({ length: 10 }).map(async (item, index) => {
      console.time(`call ${index}`)
      try {
        const result = await memoized('foo', 3, 'bar')
        console.timeEnd(`call ${index}`)
        return result
      } catch (e) {
        console.log(e)
      }
    })
  )
    .catch(e => {
      console.log(e)
    })
    .then(() => {
      console.log('finish')
    })
}

export default example()
