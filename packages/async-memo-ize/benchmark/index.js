import Benchmark from 'benchmark'
import ora from 'ora'
import logger from 'logdown'
import Table from 'cli-table2'
import memoizee from 'memoizee'
import asyncMemoize from '../build'
import express from 'express'
import axios from 'axios'

const debug = logger('')
const results = []
const spinner = ora('Running benchmark')

function showResults (benchmarkResults) {
  const table = new Table({head: ['NAME', 'OPS/SEC', 'RELATIVE MARGIN OF ERROR', 'SAMPLE SIZE']})
  benchmarkResults.forEach((result) => {
    table.push([
      result.target.name,
      result.target.hz.toLocaleString('en-US', {maximumFractionDigits: 0}),
      `± ${result.target.stats.rme.toFixed(2)}%`,
      result.target.stats.sample.length
    ])
  })

  console.log(table.toString())
}

function sortDescResults (benchmarkResults) {
  return benchmarkResults.sort((a, b) => a.target.hz < b.target.hz ? 1 : -1)
}

function onCycle (event) {
  results.push(event)
  ora(event.target.name).succeed()
}

function onComplete () {
  spinner.stop()
  debug.log()

  const orderedBenchmarkResults = sortDescResults(results)
  showResults(orderedBenchmarkResults)
}

spinner.start()

//
// Benchmark
//

const request = path => axios.get(path)
const fibNumber = 20

const fibonacci = (n) => {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2)
}

const fibonacciAsync = async (n) => {
  return n < 2
    ? n
    : await fibonacciAsync(n - 1) + await fibonacciAsync(n - 2)
}

const asyncMemoizedWithMemoizee = memoizee(fibonacciAsync, { promise: 'then' });
const asyncMemoized = asyncMemoize(fibonacciAsync)

const app1 = express()
app1.get('/vanilla', async (req, res) => {
  const num = await fibonacciAsync(fibNumber)
  res.send(JSON.stringify(num))
})
app1.get('/memoizee', async (req, res) => {
  const num = await asyncMemoizedWithMemoizee(fibNumber)
  res.send(JSON.stringify(num))
})
// app.get('/async-memo-ize/sync', (req, res) => res.send(JSON.stringify(syncMemoized(fibNumber))))
app1.get('/async-memo-ize', async (req, res) => {
  const num = await asyncMemoized(fibNumber)
  res.send(JSON.stringify(num))
})

app1.listen(3000, function() {
  console.log('Express running on port 3000')
})

const benchmark = new Benchmark.Suite()

benchmark
  .add('vanilla async', {
    'defer': true,
    'fn': async deferred => {
      await request('http://localhost:3000/vanilla')
      deferred.resolve()
    }
  })
  .add(`Memoizee`, {
    'defer': true,
    'fn': async deferred => {
      await request('http://localhost:3000/memoizee')
      deferred.resolve()
    }
  })
  .add(`async-memo-ize`, {
    'defer': true,
    'fn': async deferred => {
      await request('http://localhost:3000/async-memo-ize')
      deferred.resolve()
    }
  })
  .on('cycle', onCycle)
  .on('complete', onComplete)
  .run({'async': true})
