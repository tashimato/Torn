import { csvRows } from '../utils/parsers/csv-parser.js'
import { asyncIter, streamMap } from '../utils/stream-utils.js'

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} CsvToJsonOptions
 * @property {string[]} [key] - csv keys
 * @property {string} [delimiter] - delimiter is `,` by default
 * @property {string} [escape] - escape is `"` by default
 */

class CsvToJson extends TransformStream {
  /**
   *
   * @param {CsvToJsonOptions} [options]
   */
  constructor (options = {}) {
    super({
      start (controller) {
        const { keys, ...csvOpt } = options
        this._partialCsv = ''
        this._keys = typeof keys === 'undefined' ? null : keys
        this._csvOptions = csvOpt
        this._decoder = new TextDecoder('utf-8')
        this._ctrl = controller
      },
      async transform (chunk, controller) {
        chunk = await chunk
        if (chunk === null) controller.terminate()

        const csv = typeof chunk === 'string' ? chunk : this._decoder.decode(chunk, { stream: true })

        const { rows: data, partial } = csvRows(this._partialCsv + csv, this._csvOptions)

        this._partialCsv = partial

        let rows

        if (this._keys === null) {
          const [keys, ...others] = data
          this._keys = keys
          rows = others
        } else {
          rows = data
        }

        const modified = rows.map(row => this._keys.reduce((obj, key, i) => {
          obj[key] = row[i]
          return obj
        }, {}))

        modified.forEach(row => {
          controller.enqueue(row)
        })
      },
      flush () {
        if (this._partialCsv) {
          // csv may not end with \n, so one row may left
          const { rows: [lastRow] } = csvRows(this._partialCsv + '\n', this._csvOptions)
          if (typeof lastRow !== 'undefined') {
            const row = this._keys.reduce((obj, key, i) => {
              obj[key] = lastRow[i]
              return obj
            }, {})
            this._ctrl.enqueue(row)
          }
        }
        // code cleanup
        this._partialCsv = null
        this._keys = null
        this._csvOptions = null
        this._decoder = null
        this._ctrl = null
      }
    })

    this.readable[Symbol.asyncIterator] = asyncIter
    this.readable.map = streamMap
  }
}

export { CsvToJson }
