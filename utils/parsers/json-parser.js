function jsonParser (json = '') {
  const length = json.length
  let start = false; let dept = 0; let escape = false; let faze = false; let obj = ''; const items = []
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
      if (faze) {
        obj += char
        faze = false
        continue
      }
      escape = !escape
      obj += char
      continue
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

    if (char === '\\') {
      faze = !faze
    } else if (faze) {
      faze = false
    }

    if (start) { obj += char }
  }

  return { items, partial: obj }
}

export { jsonParser }
