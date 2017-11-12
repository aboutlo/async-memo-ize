import Benchmark from 'benchmark'
import ora from 'ora'
import logger from 'logdown'
import Table from 'cli-table2'
import asyncMemoize from 'async-memo-ize'
import RedisCache from '../build'
import express from 'express'
import axios from 'axios'

const debug = logger('')
const results = []
const spinner = ora('Running benchmark')

function showResults(benchmarkResults) {
  const table = new Table({
    head: ['NAME', 'OPS/SEC', 'RELATIVE MARGIN OF ERROR', 'SAMPLE SIZE'],
  })
  benchmarkResults.forEach(result => {
    table.push([
      result.target.name,
      result.target.hz.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      `± ${result.target.stats.rme.toFixed(2)}%`,
      result.target.stats.sample.length,
    ])
  })

  console.log(table.toString())
}

function sortDescResults(benchmarkResults) {
  return benchmarkResults.sort((a, b) => (a.target.hz < b.target.hz ? 1 : -1))
}

function onCycle(event) {
  results.push(event)
  ora(event.target.name).succeed()
}

function onComplete(cache) {
  spinner.stop()
  debug.log()
  cache.del('fibonacciAsync,20')

  const orderedBenchmarkResults = sortDescResults(results)
  showResults(orderedBenchmarkResults)
}

spinner.start()

//
// Benchmark
//

const request = path => axios.get(path)
const fibNumber = 20

const fibonacci = n => {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2)
}

const fibonacciAsync = async n => {
  return n < 2
    ? n
    : (await fibonacciAsync(n - 1)) + (await fibonacciAsync(n - 2))
}

const asyncMemoized = asyncMemoize(fibonacciAsync)
const redisCache = new RedisCache()
const asyncMemoizedWithRedis = asyncMemoize(fibonacciAsync, redisCache)

const app1 = express()

app1.get('/without-redis', async (req, res) => {
  const num = await asyncMemoized(fibNumber)
  res.send(JSON.stringify(num))
})

app1.get('/with-redis', async (req, res) => {
  const num = await asyncMemoizedWithRedis(fibNumber)
  res.send(JSON.stringify(num))
})

app1.listen(3000, function() {
  console.log('Express running on port 3000')
})

const benchmark = new Benchmark.Suite()

benchmark
  .add(`with redis`, {
    defer: true,
    fn: async deferred => {
      await request('http://localhost:3000/with-redis')
      deferred.resolve()
    },
  })
  .add(`without Redis`, {
    defer: true,
    fn: async deferred => {
      try {
        await request('http://localhost:3000/without-redis')
      } catch (e) {
        console.log('error', e)
      }

      deferred.resolve()
    },
  })
  .on('cycle', onCycle)
  .on('complete', onComplete.bind(undefined, redisCache))
  .run({ async: true })
