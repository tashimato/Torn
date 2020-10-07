import { jsonParser } from '../utils/parsers/json-parser.js'
import asyncIter from '../utils/async-iter.js'

class JsonParserStream extends TransformStream {
  constructor () {
    super({
      start () {
        this.partialJson = ''
        this.decoder = new TextDecoder('utf-8')
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()

        const json = typeof chunk === 'string' ? chunk : this.decoder.decode(chunk, { stream: true })

        const { items, partial } = jsonParser(this.partialJson + json)

        this.partialJson = partial

        items.forEach(item => {
          controller.enqueue(item)
        })
      },
      flush () {
        this.partialJson = null
        this.decoder = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

export { JsonParserStream }
