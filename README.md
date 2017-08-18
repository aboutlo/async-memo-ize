# Async Memoize
[![npm version](https://badge.fury.io/js/async-memo-ize.svg)](https://badge.fury.io/js/async-memo-ize) [![CircleCI](https://circleci.com/gh/aboutlo/async-memo-ize/tree/master.svg?style=shield)](https://circleci.com/gh/aboutlo/async-memo-ize/tree/master) [![Greenkeeper badge](https://badges.greenkeeper.io/aboutlo/async-memo-ize.svg)](https://greenkeeper.io/)

> In computing, memoization or memoisation is an optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again
> — Wikipedia

This library is an attempt to make async function, aka Promises, first class citizen with memoization

Use cases covered:
1) An expensive function call (eg. API calls, intensive CPU calculations, etc) 
2) Multiple nodejs instances with a centralized cache (eg. Redis)

**Notice:** sync function can be used too

### Real project use case 

A NodeJS cluster computes a calculation every day for each user. 
The calculation is incremental using the data from the last 90 days. 
With this approach, the calculus can be distributed across all the available nodes, and the results are shared among them via a distributed cache (e.g. Redis)
So that, it isn't necessary crunching data from the previous days again and again.  
 
## Install

    npm install async-memo-ize

or

    yarn add  async-memo-ize

## Usage

Named functions
```js
import memoize from 'async-memo-ize'
import sleep from 'sleep-promise';

const whatsTheAnswerToLifeTheUniverseAndEverything = async () => {
     await sleep(2000);
     return 42
}
const memoized = memoize(whatsTheAnswerToLifeTheUniverseAndEverything)

const answer = await memoized() // wait 2 seconds 
const quickAnswer = await memoized() // wait ms  
```

Anonymous functions

```js
import memoize from 'async-memo-ize'
import sleep from 'sleep-promise';

const whatsTheAnswerToLifeTheUniverseAndEverything = memoize(async () => {
                                                                  await sleep(2000);
                                                                  return 42
                                                             }, {id: 'whatsTheAnswerToLifeTheUniverseAndEverything'})

const answer = await whatsTheAnswerToLifeTheUniverseAndEverything() // wait 2 seconds 
const quickAnswer = await whatsTheAnswerToLifeTheUniverseAndEverything() // wait ms  
```

If you prefer to memoize anonymous function, you have to pass a unique `id`. 
The `id` is used to generate the cache `key` and it is required to share the same cache across multiple memoized functions. 
Named functions don't need because the lib rely on `fn.name` as `id`   

## Cache

### In Memory

A simple in memory async cache based on native js Map is provided.

#### Usage

```js
import memoize, {LocalCache} from 'async-memo-ize'

const fn = async () => Promise.resolve(42)
const memoized = memoize(fn, new LocalCache)

const answer = await memoized() // wait ms  
```

You can provide your own implementation given the below interface:

```
class LocalCache {

  async has(key) {
    ...
  }

  async get(key) {
    ...
  }

  async set(key, value) {
    ...
  }

  async del(key) {
    ...
  }

  async entries() {
    ...
  }

  async size() {
    ...
  }
}
```

### Redis
If you want delegate and share the cache between NodeJs instances you can use RedisCache.

    yarn install async-memo-ize-plugin-redis-cache 

#### Usage

```js
import memoize from 'async-memo-ize'
import RedisCache from 'async-memo-ize-plugin-redis-cache'

const fn = async () => 42
const memoized = memoize(fn, new RedisCache())

const anser = await memoized()
```
**Notice**
 
The `key` name, serialized on Redis, is based on the function args and his name. 

Given:
```
const doSomething = async (a, b) => a+b

```
The key generated:

```
["doSomething",1,5]
```

It means multiple NodeJs instances can share the value computed if the function name and the args match.  

## Test

### Prerequisites

    docker run -d -p 6379:6379 redis:alpine  

### Run

    yarn test

## Release

    lerna publish


## TODO
- Calculate at runtime a safe default for SimpleCache max
- Decide if or not to implement .entries() and .size on RedisCache
- Evaluate to create an ES5 compatible version 

Reminder for SimpleCache max

    -max_old_space_size
    echo console.log(process.argv.splice(2)) > index.js
    node index.js --max_old_space_size -expose_gc
