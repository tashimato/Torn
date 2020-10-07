import { hexColor, getCorrectTextColor } from '../utils/color.js'

class Logger extends WritableStream {
  constructor (fn) {
    super({
      async write (chunk) {
        chunk = await chunk
        console.log(typeof fn === 'function' ? fn(chunk) : chunk)
      }
    })
  }
}

class CrazyLogger extends WritableStream {
  constructor (fn) {
    super({
      async write (chunk) {
        chunk = await chunk
        const color = hexColor()
        console.log(`%c${typeof fn === 'function' ? fn(chunk) : chunk}`, `color:${getCorrectTextColor(color)};background-color:${color};padding:2px;`)
      }
    })
  }
}

export { Logger, CrazyLogger }
