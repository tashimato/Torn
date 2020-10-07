function hexColor () {
  return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
}

function getCorrectTextColor (hex) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  // https://codepen.io/davidhalford/pen/ywEva?editors=0010
  const threshold = 130
  const cBrightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  if (cBrightness > threshold) {
    return '#000000'
  } else {
    return '#ffffff'
  }
}

export {
  hexColor,
  getCorrectTextColor
}
