function jsonParser (json = '') {
  const length = json.length
  let start = false; let dept = 0; let escape = false; let faze = 0; let obj = ''; const items = []
  for (let i = 0; i < length; i++) {
    const char = json[i]

    if (char === '{') {
      if (!escape) {
        start = true
        dept++
      }
      obj += char
      continue
    }

    if (char === '"') {
      if (faze === 1) {
        obj += char
        faze = 0
        continue
      }
      escape = !escape
    }

    if (char === '\\') {
      faze = (faze === 1) ? 0 : 1
      // if (faze === 1) { faze = 0 } else { faze = 1 }
    } else if (faze === 1) {
      faze = 0
    }

    if (char === '}') {
      if (!escape) {
        dept--
      }
      obj += char
      if (dept === 0) {
        items.push(JSON.parse(obj))
        start = false
        obj = ''
        // escape = false
      }
      continue
    }

    if (start) { obj += char }
  }

  return { items, partial: obj }
}

export { jsonParser }
