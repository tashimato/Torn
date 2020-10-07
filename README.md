<div align="center" style="margin-top:10px">
<h1 style="color:#F0DB4F" align="center">Torn.js</h1>
Torn is an <u>experimental</u> module for working with Streams in web browsers
</div>


### get some text

```javascript
import { TxtDecoderStream, Logger } from './torn.js'

async function main() {

  const res = await fetch('./data/text1.txt')

  res.body
    .pipeThrough(new TxtDecoderStream())
    .pipeTo(new Logger())

  //chrome has TextDecoderStream it self:  .pipeThrough(new TextDecoderStream())
  //I may delete Torn's TxtDecoderStream in next versions 🚮

}

main()
```

### Handling Large csv files with `CsvToJson`

```javascript
import { CsvToJson, Logger } from './torn.js'

async function main() {
    //11 MB csv data
    const url = 'https://www.stats.govt.nz/assets/Uploads/Business-price-indexes/Business-price-indexes-June-2020-quarter/Download-data/business-price-indexes-june-2020-quarter-csv-corrected.csv'
    const cors = 'https://cors-anywhere.herokuapp.com/' //solves the cross origin problem

    const res = await fetch(cors + url)

    res.body
        .pipeThrough(new CsvToJson())
        .pipeTo(new Logger())

}

main().catch(err => {
    console.log('we go ERROR:', err)
})
```

<img src="https://github.com/tashimato/tf-images/blob/master/torn%20images/csv-logging.png?raw=true" width="700">

#### You can also use `CrazyLogger`

```javascript
import { CsvToJson, CrazyLogger } from './torn.js'

async function main() {
    //11 MB csv data
    const url = 'https://www.stats.govt.nz/assets/Uploads/Business-price-indexes/Business-price-indexes-June-2020-quarter/Download-data/business-price-indexes-june-2020-quarter-csv-corrected.csv'
    const cors = 'https://cors-anywhere.herokuapp.com/' //solves the cross origin problem

    const res = await fetch(cors + url)

    res.body
        .pipeThrough(new CsvToJson())
        .pipeTo(new CrazyLogger(data => JSON.stringify(data))) //needs to stringify or its gonna log [object Object]

}

main().catch(err => {
    console.log('we go ERROR:', err)
})
```

<img src="https://github.com/tashimato/tf-images/blob/master/torn%20images/csv-creazy-logging.png?raw=true" width="700">


#### Handle csv rows your self
```javascript
import { CsvToJson } from './torn.js'

async function main() {
    //11 MB csv data
    const url = 'https://www.stats.govt.nz/assets/Uploads/Business-price-indexes/Business-price-indexes-June-2020-quarter/Download-data/business-price-indexes-june-2020-quarter-csv-corrected.csv'
    const cors = 'https://cors-anywhere.herokuapp.com/' //solves the cross origin problem

    const res = await fetch(cors + url)

    const stream = res.body.pipeThrough(new CsvToJson())

    const data = []
    for await (const row of stream) {
        data.push(row)
    }

    console.log(data)

}

main().catch(err => {
    console.log('we go ERROR:', err)
})
```

### Handling Large json files
```javascript
import { JsonParserStream, Logger } from './torn.js'

async function main() {
    //25 MB json data
    const url = 'https://raw.githubusercontent.com/json-iterator/test-data/master/large-file.json'
    const res = await fetch(url)
    res.body
        .pipeThrough(new JsonParserStream())
        .pipeTo(new Logger())
}

main().catch(err => {
    console.log('we go ERROR:', err)
})
```
<img src="https://github.com/tashimato/tf-images/blob/master/torn%20images/JsonParserStream.png?raw=true" width="700">

#### Coming Json data format
`JsonParserStream` ignores the <u>outer</u> `,` and `[]` and parses the objects and whats inside them!
```json
[
    {
        "id": 7,
        "email": "michael.lawson@reqres.in",
        "first_name": "Michael",
        "last_name": "Lawson",
        "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/follettkyle/128.jpg",
        "friends": [9]
    },
    {
        "id": 8,
        "email": "lindsay.ferguson@reqres.in",
        "first_name": "Lindsay",
        "last_name": "Ferguson",
        "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/araa3185/128.jpg",
        "friends": [9]
    },
    {
        "id": 9,
        "email": "tobias.funke@reqres.in",
        "first_name": "Tobias",
        "last_name": "Funke",
        "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/vivekprvr/128.jpg",
        "firends": [7, 8],
        "location": {
        "city": "London",
        "coordinates": {
          "latitude": 51.5074,
          "longitude": 0.1278
        }
      }
    }
    //and so on...
]
```
OR
```json
{
    "id": 7,
    "email": "michael.lawson@reqres.in",
    "first_name": "Michael",
    "last_name": "Lawson",
    "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/follettkyle/128.jpg",
    "firends": [9]
}
{
    "id": 8,
    "email": "lindsay.ferguson@reqres.in",
    "first_name": "Lindsay",
    "last_name": "Ferguson",
    "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/araa3185/128.jpg",
    "firends": [9]
}
{
    "id": 9,
    "email": "tobias.funke@reqres.in",
    "first_name": "Tobias",
    "last_name": "Funke",
    "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/vivekprvr/128.jpg",
    "firends": [7, 8],
    "location": {
      "city": "London",
      "coordinates": {
        "latitude": 51.5074,
        "longitude": 0.1278
      }
    }
}
//and so on...
```
<img src="https://github.com/tashimato/tf-images/blob/master/torn%20images/json-format.png?raw=true" width="700">


### Iter
It returns a ReadbleStream that has `[Symbol.asyncIterator]` on it. in other word you can use `for await` on stream. `Iter` just passes the coming data with No changes.
```javascript
import { Iter } from './torn.js'

async function main() {

  const res = await fetch('./data/Tracks.csv')

  const decoder = new TextDecoder('utf-8');
  for await (const chunk of res.body.pipeThrough(new Iter())) {
    console.log(decoder.decode(chunk))
  }

}

main()
```

### Working with `StreamFormData`

```javascript
import { StreamFormData } from './torn.js'

async function main () {
  const fd = new StreamFormData()

  fd.append('name', 'tashimato')
  fd.append('age', 67)
  fd.append('id', 'XrjuEnd84k')

  // You can append Blob
  const txt = new Blob(['To', 'be', 'or', 'not', 'to', 'be', 'that', 'is', 'the', 'question'],
    { type: 'text/plain' }
  )
  fd.append('text1', txt, 'textToBe.txt')

  // or stream
  const res1 = await fetch('./data/text2.txt')
  fd.append('parag', res1.body, 'data1.csv')

  // 11 MB csv file
  const _url = 'https://www.stats.govt.nz/assets/Uploads/Business-price-indexes/Business-price-indexes-June-2020-quarter/Download-data/business-price-indexes-june-2020-quarter-csv-corrected.csv'
  const cors = 'https://cors-anywhere.herokuapp.com/'
  const res2 = await fetch(cors + _url)

  fd.append('csv_file1', res2.body, 'data2.csv')

  // stream json file
  const res3 = await fetch('https://restcountries.eu/rest/v2/all')
  fd.append('json_data', res3.body, 'countries.json')

  // Time to send
  fetch('http://localhost:3000/upload', fd.config())
    .then(res => res.text())
    .then(data => console.log(data))
}

main()
```


#### Server side:
```javascript
const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload')

const app = express()

app.use(express.static('.'))
app.use(fileUpload())

app.post('/upload', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  //saving files
  for (file of Object.values(req.files)) {
    file.mv(`./uploads/${file.name}`, function (err) {
      if (err) { return res.status(500).send(err) }
    })
  }

  console.log(req.files)
  console.log('****************************')
  console.log(req.body)

  res.end('OK')
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.listen(3000, _ => {
  console.log('listening...')
})
```
<img src="https://github.com/tashimato/tf-images/blob/master/torn%20images/server.png?raw=true" width="800">

### Working with `ConnectionStream`
```javascript
 import { ConnectionStream } from './torn.js'

async function main() {
    if (navigator.geolocation) {
        const con = new ConnectionStream()

        fetch('http://localhost:3000/liveLocation', {
            method: 'POST',
            headers: {
                connection: 'keep-alive'
            },
            body: con.getCon(),
            allowHTTP1ForStreamingUpload: true
        })
            .then(res => res.text())
            .then(data => console.log(data))
            .catch(err => {
                console.log(err)
            }).finally(_ => {
                con.close()
            })

        navigator.geolocation.watchPosition(
            ({ coords: { latitude, longitude, accuracy } }) => {
                if (!con.closed) {
                    con.write(JSON.stringify({ latitude, longitude, accuracy }))
                } else {
                    console.log('the connection is closed!⛔')
                }
            },
            error => {
                console.log('Error: ', error)
            }, { enableHighAccuracy: true })
    }
}

main().catch(err => {
    console.log('we go ERROR:', err)
})
```

#### Simple Sever side (i'm not an expert in backend🙄):
```javascript
const express = require('express')
const path = require('path')

const app = express()

app.use(express.static('.'))

app.post('/liveLocation', function (req, res, next) {
  res.setHeader('connection', 'keep-alive')
  req.on('data', function (data) {
    console.log(data.toString('utf-8'))
  })
  req.on('close', function () {
    console.log('connection closed')
    res.end('Connection closed')
  })
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.listen(3000, _ => {
  console.log('listening...')
})

```

### Torn status:
Not many browsers support these stuff <u>YET!</u><br>
For now, you can try torn in `chrome >= version 85` with `--enable-experimental-web-platform-features` flag.<br><br>
To be honest, it's more like a experimental module for `TransformStream` 🤔. Just Try to have fun with these stuff and don't use them in any serius project <u>YET!</u>☣☢

<div align="center" style="margin-top:40px">
<img src="https://github.com/tashimato/tf-images/blob/master/climbing-the-infity.gif?raw=true">
</div>

### License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/tashimato/Torn/blob/main/LICENSE)
