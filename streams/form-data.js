import { CheeseBurgerStream } from './burgers.js'
import { DataToUInt8Stream } from './data-readers.js'
import { extToMime, mimeToExt } from '../utils/mime-type.js'

// FormData:
// https://developer.mozilla.org/en-US/docs/Web/API/FormData
// raw http format:
// https://stackoverflow.com/questions/4238809/example-of-multipart-form-data

class StreamFormData {
  #form;
  #active;

  constructor () {
    this.#form = {}
    this.#active = false
  }

  append (key, value, filename) {
    if (this.#active) {
      throw new Error('FormData is Active! You cannot appent data to this FormData anymore')
    }

    if (typeof key !== 'string') {
      throw new Error('the key be a string')
    }

    if (typeof filename !== 'undefined') {
      if (typeof filename !== 'string') {
        throw new Error('the file name must be string')
      }
      if (!(value instanceof Blob) && !(value instanceof ReadableStream)) { throw new Error("parameter 2 is not of type 'Blob' or 'ReadbleStream'") }
    }

    if (!(value instanceof Blob) && !(value instanceof ReadableStream)) {
      value = value + ''
    }

    if (typeof this.#form[key] === 'undefined') {
      this.#form[key] = []
    }

    this.#form[key].push({
      value,
      filename
    })
  }

  delete (key) {
    if (this.#active) {
      throw new Error('FormData is Active! You cannot delete data in this FormData anymore')
    }

    if (typeof key !== 'string') {
      throw new Error('the key be a string')
    }
    if (!(key in this.#form)) {
      throw new Error('no such a key exist!')
    }
    this.#form[key] = null
    delete this.#form[key]
  }

  * entries () {
    for (const key of Object.keys(this.#form)) {
      for (const obj of this.#form[key]) {
        yield [key, obj.value]
      }
    }
  }

  get (key) {
    if (typeof key !== 'string') {
      throw new Error('the key be a string')
    }
    if (!(key in this.#form)) {
      return null
    }
    return this.#form[key][0].value
  }

  getAll (key) {
    if (typeof key !== 'string') {
      throw new Error('the key be a string')
    }
    if (!(key in this.#form)) {
      throw new Error('invlid key')
    }
    return this.#form[key].map(obj => obj.value)
  }

  has (key) {
    if (typeof key !== 'string') {
      throw new Error('the key be a string')
    }
    if (key in this.#form) {
      return true
    } else {
      return false
    }
  }

  * keys () {
    for (const key of Object.keys(this.#form)) {
      yield key
    }
  }

  set (key, value, filename) {
    if (this.#active) {
      throw new Error('FormData is Active! You cannot set data to this FormData anymore')
    }

    if (typeof key !== 'string') {
      throw new Error('the key be a string')
    }

    if (typeof filename !== 'undefined') {
      if (typeof filename !== 'string') {
        throw new Error('the file name must be string')
      }
      if (!(value instanceof Blob) && !(value instanceof ReadableStream)) { throw new Error("parameter 2 is not of type 'Blob' or 'ReadbleStream'") }
    }

    if (!(value instanceof Blob) && !(value instanceof ReadableStream)) {
      value = value + ''
    }

    this.#form[key] = []
    this.#form[key].push({
      value,
      filename
    })
  }

  * values () {
    for (const arr of Object.values(this.#form)) {
      for (const obj of arr) {
        yield obj.value
      }
    }
  }

  config () {
    if (this.#active) {
      throw new Error('this FormData is already active!')
    }
    this.#active = true
    // create boundry:
    // [...Array(10)].map(i=>((Math.random()*36) | 0).toString(36)).join('')
    // OR
    // Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const boundary = [...Array(20)].map(() => ((Math.random() * 36) | 0).toString(36)).join('')
    const CRNL = '\r\n'
    const encoder = new TextEncoder()

    const burger = new CheeseBurgerStream({
      tail: encoder.encode(`${CRNL}--${boundary}--`),
      separator: encoder.encode(`${CRNL}--${boundary}${CRNL}`)
    })

    for (const key of Object.keys(this.#form)) {
      for (const { value, filename } of this.#form[key]) {
        const payload = makePayload(key, value, filename)

        let data = value
        if (!(data instanceof ReadableStream)) { data = new DataToUInt8Stream(data) }

        burger.add(data, encoder.encode(payload))
      }
    }

    return ({
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Transfer-Encoding': 'chunked',
        Connection: 'keep-alive'
      },
      body: burger.serve(),
      allowHTTP1ForStreamingUpload: true
    })
  }
}

function makePayload (name, data, filename) {
  const CRNL = '\r\n'
  let payload = `Content-Disposition: form-data; name="${name.replace(/"/g, '%22')}"`

  // filename
  if (filename) {
    payload += `;filename="${filename.replace(/"/g, '%22')}"`
  } else if (data instanceof Blob) {
    if (data.name) {
      payload += `;filename="${data.name.replace(/"/g, '%22')}"`
    } else if (data.type) {
      const ext = mimeToExt(data.type)
      if (typeof ext !== 'undefined') { payload += `;filename="${Math.random().toString(36).substring(2)}.${ext}"` }
    }
  }

  // content-type
  if (data instanceof Blob || data instanceof ReadableStream) {
    let contentType
    if (data.type) {
      contentType = data.type
    } else if (filename) {
      const mime = extToMime(filename.split('.').pop())
      if (typeof mime !== 'undefined') { contentType = mime }
    }
    if (!contentType) {
      contentType = 'application/octet-stream'
    }
    payload += `${CRNL}Content-Type: ${contentType}`
  }

  payload += `${CRNL}${CRNL}`
  return payload
}

export { StreamFormData }
