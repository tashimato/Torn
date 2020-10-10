import { hexColor, getCorrectTextColor } from '../utils/color.js'

class Logger extends WritableStream {
  constructor () {
    super({
      async write (chunk) {
        chunk = await chunk
        console.log(chunk)
      }
    })
  }
}

class CrazyLogger extends WritableStream {
  constructor (fn) {
    super({
      async write (chunk) {
        let data = await chunk
        if (typeof fn === 'function') {
          data = await Promise.resolve(fn(chunk))
        }
        const color = hexColor()
        console.log(`%c${data}`, `color:${getCorrectTextColor(color)};background-color:${color};padding:2px;`)
      }
    })
  }
}

export { Logger, CrazyLogger }
