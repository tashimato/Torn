// What's the idea? 🍔 here it is: https://github.com/connrs/node-sandwich-stream

class BurgerStream {
  constructor ({ head, tail, separator }) {
    this.head = head
    this.tail = tail
    this.separator = separator
    this.streams = []
  }

  add (stream) {
    if (!(stream instanceof ReadableStream)) {
      throw new Error('the input must be a ReadableStream')
    }
    this.streams.push(stream)

    return this
  }

  /**
     * @returns {ReadableStream}
     */
  serve () {
    const { writable, readable } = new TransformStream()

    multiWriter(writable, this.streams, { head: this.head, tail: this.tail, separator: this.separator })

    return readable
  }
}

/**
 *
 * @param {WritableStream} writable
 * @param {ReadableStream[]} streams
 * @param {{head:string,tail:string,separator:string}} opt
 */
async function multiWriter (writable, streams, opt) {
  const writer = await writable.getWriter()

  // write head
  if (typeof opt.head !== 'undefined') { await writer.write(opt.head) }

  for (const stream of streams) {
    const reader = stream.getReader()

    // write separator
    if (typeof opt.separator !== 'undefined') { await writer.write(opt.separator) }

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      await writer.ready
      await writer.write(value)
    }
    reader.releaseLock()
  }

  // write tail
  if (typeof opt.tail !== 'undefined') { await writer.write(opt.tail) }

  await writer.ready
  await writer.close()
}

class CheeseBurgerStream {
  constructor ({ head, tail, separator }) {
    this.head = head
    this.tail = tail
    this.separator = separator
    this.streams = []
  }

  add (stream, extra) {
    if (!(stream instanceof ReadableStream)) {
      throw new Error('the input must be a ReadableStream')
    }
    this.streams.push({ stream, extra })

    return this
  }

  /**
     * @returns {ReadableStream}
     */
  serve () {
    const { writable, readable } = new TransformStream()

    extraMultiWriter(writable, this.streams, { head: this.head, tail: this.tail, separator: this.separator })

    return readable
  }
}

/**
 *
 * @param {WritableStream} writable
 * @param {ReadableStream[]} streams
 * @param {{head:string,tail:string,separator:string}} opt
 */
async function extraMultiWriter (writable, streams, opt) {
  const writer = await writable.getWriter()

  // write head
  if (typeof opt.head !== 'undefined') { await writer.write(opt.head) }

  for (const { stream, extra } of streams) {
    const reader = stream.getReader()

    // write separator
    if (typeof opt.separator !== 'undefined') { await writer.write(opt.separator) }
    if (typeof extra !== 'undefined') { await writer.write(extra) }

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      await writer.ready
      await writer.write(value)
    }
    reader.releaseLock()
  }

  // write tail
  if (typeof opt.tail !== 'undefined') { await writer.write(opt.tail) }

  await writer.ready
  await writer.close()
}

export { BurgerStream, CheeseBurgerStream }
