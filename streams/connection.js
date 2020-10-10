import { readFile } from '../utils/promisify.js'

class ConnectionStream {
  #writer
  #readable
  #enoder
  #isClosed
  constructor () {
    const stream = new TransformStream()
    this.#readable = stream.readable
    this.#writer = stream.writable.getWriter()
    this.#enoder = new TextEncoder()
    this.#isClosed = false
  }

  get closed () {
    return this.#isClosed
  }

  async write (data) {
    if (this.#isClosed) {
      throw new Error('Cannot write to a CLOSED writer!')
    }
    let chunk
    switch (typeof data) {
      case 'string':
        chunk = this.#enoder.encode(data)
        break
      case 'number':
      case 'bigint':
        chunk = this.#enoder.encode(data.toString())
        break
      case 'object':
        if (data instanceof Blob) {
          if ('arrayBuffer' in data) {
            chunk = await data.arrayBuffer()
          } else {
            chunk = await readFile(data)
          }
        }
        break
    }

    await this.#writer.ready
    await this.#writer.write(chunk)
  }

  async close () {
    await this.#writer.ready
    await this.#writer.close()
    this.#isClosed = true
  }

  getCon () {
    return this.#readable
  }
}

export { ConnectionStream }
