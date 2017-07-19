class SimpleCache {

  constructor(cache = new Map()) {
    this.client = cache
  }

  async has(key) {
    return new Promise((resolve, reject) => {
      return resolve(this.client.has(key))
    })
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      return resolve(this.client.get(key))
    })
  }

  async set(key, value) {
    return new Promise((resolve, reject) => {
      return resolve(this.client.set(key,value))
    })
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      return resolve(this.client.delete(key))
    })
  }

  async entries() {
    return new Promise((resolve, reject) => {
      return resolve(this.client.entries())
    })
  }

  async size() {
    return new Promise((resolve, reject) => {
      return resolve(this.client.size)
    })
  }
}

export default SimpleCache
