import asyncIter from '../utils/async-iter.js'

class TxtDecoderStream extends TransformStream {
  constructor () {
    super({
      start () {
        this.decoder = new TextDecoder('utf-8')
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()
        controller.enqueue(this.decoder.decode(chunk, { stream: true }))
      },
      flush () {
        this.decoder = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

class TxtEncoderStream extends TransformStream {
  constructor () {
    super({
      start () {
        this.encoder = new TextEncoder()
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()
        controller.enqueue(this.encoder.encode(chunk, { stream: true }))
      },
      flush () {
        this.encoder = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

export { TxtDecoderStream, TxtEncoderStream }
