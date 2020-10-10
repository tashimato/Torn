import { asyncIter } from '../utils/stream-utils.js'

class TxtDecoderStream extends TransformStream {
  constructor () {
    super({
      start () {
        this._decoder = new TextDecoder('utf-8')
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()
        controller.enqueue(this._decoder.decode(chunk, { stream: true }))
      },
      flush () {
        this._decoder = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

class TxtEncoderStream extends TransformStream {
  constructor () {
    super({
      start () {
        this._encoder = new TextEncoder()
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()
        controller.enqueue(this._encoder.encode(chunk, { stream: true }))
      },
      flush () {
        this._encoder = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

export { TxtDecoderStream, TxtEncoderStream }
