import memoize from '../lib'

const whatsTheAnswerToLifeTheUniverseAndEverything = async (a, b, c) =>
  new Promise(resolve => {
    setTimeout(function() {
      console.log('done!')
      resolve([1, 21, 20].reduce((memo, current) => memo + current, 0))
    }, 2000)
  })

const example = async () => {
  const memoized = memoize(whatsTheAnswerToLifeTheUniverseAndEverything)
  // first call
  console.time('compute first')
  console.log('doSomething:', await memoized('foo', 3, 'bar'))
  console.timeEnd('compute first')

  // next 100 calls
  const promises = Array.from({ length: 100 }).map(async (item, index) => {
    console.time(`call ${index}`)
    const result = await memoized('foo', 3, 'bar')
    console.timeEnd(`call ${index}`)
    return result
  })

  return Promise.all(promises)
}

export default example()
