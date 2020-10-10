function csvRows (csv = '', options = {}) {
  const { delimiter = ',', escape = '"' } = options

  const length = csv.length
  let token = ''; const rows = []; let row = []; let escaping = false; let faze = false; const endline = '\n'; let partial = ''; let reachChar = false; let hadEscape = false

  for (let i = 0; i < length; i++) {
    const char = csv[i]

    partial += char

    if (char === escape) {
      if (escaping) {
        if (faze) {
          token += escape
          faze = false
        } else {
          faze = true
        }
        continue
      }
      escaping = true
      continue
    } else if (faze) {
      escaping = false
      faze = false
      hadEscape = true
    }

    switch (char) {
      case delimiter:
        row.push(hadEscape ? token : token.trimRight())
        token = ''
        reachChar = false
        hadEscape = false
        break
      case endline:
        row.push(hadEscape ? token : token.trimRight())
        rows.push(row)
        token = ''
        reachChar = false
        hadEscape = false
        row = []
        partial = ''
        continue
      case ' ':
        if (reachChar) token += char
        continue
      case '\r':
        continue
      default:
        token += char
        reachChar = true
        break
    }
  }

  return { rows, partial }
}

export { csvRows }
