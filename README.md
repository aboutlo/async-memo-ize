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

A docker cluster with multiple NodeJs nodes compute a calculation every day for each user 
The calculation is incremental using the data from the last 90 days. 
With this approach, the computation can be distributed across all the nodes available. 
It avoids crunching data from the previous days again and again.  
 
## Install

    npm install async-memo-ize

or

    yarn add  async-memo-ize

## Usage

```js
import memoize from 'async-memo-ize'
import sleep from 'sleep-promise';

const whatsTheAnswerToLifeTheUniverseAndEverything = async () => {
     await sleep(2000);
     return Promise.resolve(42)
}
const memoized = memoize(whatsTheAnswerToLifeTheUniverseAndEverything)

const answer = await memoized() // wait 2 seconds 
const quickAnswer = await memoized() // wait ms  
```

## Cache

### In Memory

A simple in memory async cache based on native js Map is provided.

### Usage

```js
import memoize, {SimpleCache} from 'async-memo-ize'

const fn = async () => Promise.resolve(42)
const memoized = memoize(fn, new SimpleCache)

const answer = await memoized() // wait ms  
```

You can provide your own implementation given the below interface:

```
class SimpleCache {

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
If you want delegate and share the cache you can use RedisCache. 
The generated `key` is based on the function args and his name 

Given:
```
const doSomething = async (a, b) => Promise.resolve(a+b)

```
The key generated:

```
["doSomething",1,5]
```

It means multiple nodejs instances can share the value computed if the function name and the args match.  

### Usage
```js
import memoize, {RedisCache} from 'async-memo-ize'

const fn = async () => Promise.resolve(42)
const memoized = memoize(fn, new RedisCache())

const answer = await memoized() // wait ms  
```

## test

### prerequisites

    docker run --name cache-redis -d -p 6379:6379 redis:alpine  

### run

    yarn test

