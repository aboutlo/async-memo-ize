import {LRUMap} from 'lru_map'

class LocalCache {
  // TODO calculate a better max default based on available memory
  constructor(options = {max: Infinity}) {
    const {max} = options
    // console.log('max:', max)
    this.client = new LRUMap(max)
  }

  async has(key) {
    return this.client.has(key)
  }

  async get(key) {
    return this.client.get(key)
  }

  async set(key, value) {
    return this.client.set(key, value)
  }

  async del(key) {
    return this.client.delete(key)
  }

  async clear() {
    return this.client.clear()
  }

  async entries() {
    return this.client.entries()
  }

  async size() {
    return this.client.size
  }
}

export { LocalCache }
