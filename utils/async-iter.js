async function * asyncIter () {
  const reader = this.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    yield value
  }
}

export default asyncIter
