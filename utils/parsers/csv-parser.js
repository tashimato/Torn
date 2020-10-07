function csvRows (csv = '', options = {}) {
  const { delimiter = ',', escape = '"' } = options

  const length = csv.length
  let token = ''; const rows = []; let row = []; let escaping = false; let faze = 0; const endline = '\n'; let partial = ''

  for (let i = 0; i < length; i++) {
    const char = csv[i]

    partial += char

    if (faze === 1) {
      if (char === escape) {
        token += char
        faze = 0
        continue
      } else {
        escaping = false
        faze = 0
      }
    }

    if (char === escape) {
      if (escaping === true) {
        faze = 1
        continue
      }
      escaping = true
      continue
    }

    if (escaping === true) {
      token += char
    } else {
      if (char === delimiter) {
        row.push(token)
        token = ''
      } else if (char === endline) {
        row.push(token)
        token = ''
        rows.push(row)
        row = []
        partial = ''
        continue
      } else {
        if (char === ' ' || char === '\r') { continue }
        token += char
      }
    }
  }

  return { rows, partial }
}

export { csvRows }
