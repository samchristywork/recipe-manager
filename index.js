require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send("Hello, World!");
})

app.get('/api', (req, res) => {
  (async () => {
    const rawResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.API_KEY}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "query": req.query.q,
        "dataType": ["Branded"],
        "pageNumber": req.query.p,
        "brandOwner": req.query.brand
      })
    });
    const content = await rawResponse.json();

    res.send(content)
  })();
})

app.get('*', (req, res) => {
  res.status(400)
  res.send("Error");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
