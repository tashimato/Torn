import { csvRows } from '../utils/parsers/csv-parser.js'
import asyncIter from '../utils/async-iter.js'

class CsvToJson extends TransformStream {
  constructor (keys) {
    super({
      start () {
        this.partialCsv = ''
        this.keys = typeof keys === 'undefined' ? null : keys
        this.decoder = new TextDecoder('utf-8')
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()

        const csv = typeof chunk === 'string' ? chunk : this.decoder.decode(chunk, { stream: true })

        const { rows: data, partial } = csvRows(this.partialCsv + csv)

        this.partialCsv = partial

        let rows

        if (this.keys === null) {
          const [keys, ...others] = data
          this.keys = keys
          rows = others
        } else {
          rows = data
        }

        const modified = rows.map(row => row.reduce((pval, cval, i) => {
          pval[this.keys[i]] = cval
          return pval
        }, {}))

        modified.forEach(row => {
          controller.enqueue(row)
        })
      },
      flush () {
        this.partialChunk = null
        this.decoder = null
        this.partialCsv = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
  }
}

export { CsvToJson }
