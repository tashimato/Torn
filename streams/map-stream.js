import { asyncIter } from '../utils/stream-utils.js'

class MapStream extends TransformStream {
  constructor (fn) {
    super({
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()
        // fn may be async
        const data = await Promise.resolve(fn(chunk))
        controller.enqueue(data)
      }
    })
    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

export { MapStream }
