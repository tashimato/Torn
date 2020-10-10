import { jsonParser } from '../utils/parsers/json-parser.js'
import { asyncIter, streamMap } from '../utils/stream-utils.js'

class JsonParserStream extends TransformStream {
  constructor () {
    super({
      start () {
        this._partialJson = ''
        this._decoder = new TextDecoder('utf-8')
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()

        const json = typeof chunk === 'string' ? chunk : this._decoder.decode(chunk, { stream: true })

        const { items, partial } = jsonParser(this._partialJson + json)

        this._partialJson = partial

        items.forEach(item => {
          controller.enqueue(item)
        })
      },
      flush () {
        this._partialJson = null
        this._decoder = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
    this.readable.map = streamMap
  }
}

export { JsonParserStream }
