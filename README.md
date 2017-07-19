# README

> In computing, memoization or memoisation is an optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again
> — Wikipedia

This library is an attempt to make async function, aka Promises, first class citizen with memoization

Use cases covered:
1) An expensive function call (eg. API calls, intensive CPU calculations, etc) 
2) Multiple nodejs instances with a centralized cache (eg. Redis)

**Notice:** sync function can be used too

I did this project mainly for fun and because I hit the second use case in a real project. 

A docker cluster with multiple nodejs compute a calculation avery day for each user 
The calculation is adjusted using the data from the last 90 days. 
With this approach I distributed the calculation across all available nodes and I avoided to crunch again the previous days data 
 
## Install

    npm install async-memo-ize

or

    yarn add  async-memo-ize

## Examples

### Multiple calls

```js
import memoize from 'async-memoize'

const whatsTheAnswerToLifeTheUniverseAndEverything = async (one, two, three) => new Promise(resolve => {
  setTimeout(function(){
    console.log('done!')
    resolve([1, 2, 3].reduce((memo, current) => (memo + current),0)
  },2000)
})

const example = async () => {
  const memoized = memoize(whatsTheAnswerToLifeTheUniverseAndEverything)
  // first call
  console.time('compute first');
  console.log('doSomething:', await memoized('foo', 3, 'bar'))
  console.timeEnd('compute first');

  // another call
  console.time('again')
  console.log('doSomething Again:', await memoized('foo', 3, 'bar'))
  console.timeEnd('again')
}

export default example()
```

### Multiple calls from different node with a shared cache
 
```js
    import redis from 'redis'
    import Promise from 'bluebird'
    Promise.promisifyAll(redis.RedisClient.prototype)
    
    import memoize from 'async-memoize'
    import {RedisCache} from 'async-memoize'
    
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
      return Promise.map(
        Array.from({ length: 10 }),
        async (item, index) => {
          console.time(`call ${index}`)
          try {
            const result = await memoized('foo', 3, 'bar')
            console.timeEnd(`call ${index}`)
            return result
          }catch(e) {
            console.log(e)
          }
        },
        { concurrency: 1 }
      ).catch(e => {
        console.log(e)
      }).then(() => {
        console.log('finish')
      })
    }
    
    export default example()

```

## test

### prerequisites

    docker run --name cache-redis -d -p 6379:6379 redis:alpine  

### run

    yarn test

# TODO
- redis cache double check the return type of array and object
