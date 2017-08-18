# Async Memo-ize Plugin Redis Cache

This plugin allow [async-memo-ize](https://github.com/aboutlo/async-memo-ize/tree/master/packages/async-memo-ize) to distribute cache between multiple NodeJS instances 
  
## Install

    npm install async-memo-ize-plugin-redis-cache

or

    yarn add  async-memo-ize-plugin-redis-cache

## Usage

```js
import memoize from 'async-memo-ize'
import RedisCache from 'async-memo-ize-plugin-redis-cache'

const fn = async () => 42
const memoized = memoize(fn, new RedisCache())

const anser = await memoized()
```
**Notice**
 
The `key` name, serialized on Redis, is based on the named function args and his name.    

Given:
```
const doSomething = async (a, b) => a+b

```
The key generated:

```
["doSomething",1,5]
```

It means multiple NodeJs instances can share the value computed if the function name and the args match.
If you prefer to use an anonymous function it is required to pass an `id` as option  

## Test

### Prerequisites

    docker run -d -p 6379:6379 redis:alpine  

### Run

    yarn test
