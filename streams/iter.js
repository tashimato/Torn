import asyncIter from '../utils/async-iter.js'

class Iter extends TransformStream {
  constructor () {
    super({
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()
        controller.enqueue(chunk)
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

export { Iter }
