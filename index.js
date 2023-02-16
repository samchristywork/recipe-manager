require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT

app.use(express.static('public'))

app.get('/list', (req, res) => {
  fetch(`https://api.nal.usda.gov/fdc/v1/food/${req.query.id}?api_key=${process.env.API_KEY}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(e=>{
      if (e.status==404) {
        return;
      }
      return e.text()
    })
    .then(e=>{
      res.send(e);
    });
  })

app.get('/search', (req, res) => {
  let datatype=[];

  if (req.query.type=='branded') {
    datatype.push("Branded");
  } else if (req.query.type=='foundation') {
    datatype.push("Foundation");
  } else {
    datatype.push("Branded");
    datatype.push("Foundation");
  }

  fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.API_KEY}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "query": req.query.q,
      "dataType": datatype,
      "pageNumber": req.query.p,
      "pageSize": 25,
      "brandOwner": req.query.brand
    })
  })
    .then(e=>{
      if (e.status==404) {
        return;
      }
      return e.text();
    })
    .then(e=>{
      res.send(e);
    });
  })

app.get('*', (req, res) => {
  res.status(400)
  res.send("Error");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
