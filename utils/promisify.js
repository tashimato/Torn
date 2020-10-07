function readFile (file) {
  return new Promise(function (resolve, reject) {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      resolve(this.result)
    }
    fileReader.onerror = function (err) {
      reject(err)
    }
    fileReader.readAsArrayBuffer(file)
  })
}

export { readFile }
