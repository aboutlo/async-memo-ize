class SimpleCache {
  constructor(cache = new Map()) {
    this.client = cache
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

  async entries() {
    return this.client.entries()
  }

  async size() {
    return this.client.size
  }
}

export { SimpleCache }
