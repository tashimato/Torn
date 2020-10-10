import { MapStream } from '../streams/map-stream.js'

async function * asyncIter () {
  const reader = this.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    yield value
  }
}

function streamMap (fn) {
  return this.pipeThrough(new MapStream(fn))
}

export { asyncIter, streamMap }
