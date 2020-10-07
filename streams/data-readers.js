import { readFile } from '../utils/promisify.js'

class DataToUInt8Stream extends ReadableStream {
  constructor(data) {
    super({
      async start(controller) {
        if (data instanceof Blob) {
          if ('stream' in data) {
            const reader = data.stream().getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                controller.close()
                return;
              }
              controller.enqueue(value)
            }
          } else if ('arrayBuffer' in data) {
            const buffer = await data.arrayBuffer()
            controller.enqueue(new Uint8Array(buffer))
            controller.close()
          } else {
            const buffer = await readFile(data)
            controller.enqueue(new Uint8Array(buffer))
            controller.close()
          }
        } else if (typeof data === 'string') {
          controller.enqueue(new TextEncoder().encode(data))
          controller.close()
        } else if (typeof data === 'number' || typeof data === 'bigint') {
          controller.enqueue(new TextEncoder().encode(data.toString()))
          controller.close()
        }
      }
    })
  }
}

export { DataToUInt8Stream }
