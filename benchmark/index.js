import Benchmark from 'benchmark'
import ora from 'ora'
import logger from 'logdown'
import Table from 'cli-table2'
import fastMemoize from 'fast-memoize'
import memoizee from 'memoizee'
import asyncMemoize from '../build'

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

const fibonacci = (n) => {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2)
}

const fibonacciAsync = async (n) => {
  return n < 2 ? Promise.resolve(n) : Promise.resolve(fibonacciAsync(n - 1) + fibonacciAsync(n - 2))
}

const fibNumber = 15

const memoizedWithFastMemoize = fastMemoize(fibonacci)
const memoizedWithMemoizee = memoizee(fibonacciAsync, { promise: 'then' });
const syncMemoized = asyncMemoize(fibonacci)
const asyncMemoized = asyncMemoize(fibonacciAsync)

const benchmark = new Benchmark.Suite()

benchmark
  .add('vanilla', () => {
    fibonacci(fibNumber)
  })
  .add('vanilla async', () => {
    fibonacciAsync(fibNumber)
  })
  .add(`fast-memoize`, () => {
    memoizedWithFastMemoize(fibNumber)
  })
  .add(`Memoizee`, () => {
    memoizedWithMemoizee(fibNumber)
  })
  .add(`async-memo-ize sync`, () => {
    syncMemoized(fibNumber)
  })
  .add(`async-memo-ize async`, () => {
    asyncMemoized(fibNumber)
  })
  .on('cycle', onCycle)
  .on('complete', onComplete)
  .run({'async': true})
