const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const fileUpload = require('express-fileUpload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nuuqz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());


const port = 5000

app.get('/', (req, res) => {
  res.send('Hello working form creative agency!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creativeAgency").collection("services");
  const placeOrderCollection = client.db("Creative-Agency").collection("placeOrder");
  const reviewCollection = client.db("Creative-Agency").collection("reviews");
  const adminCollection = client.db("Creative-Agency").collection("adminList");
  console.log('database connected')

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const filePath = `${__dirname}/services/${file.name}`;
    const newImg =file.data
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    servicesCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/getServices', (req,res) => {
    servicesCollection.find({})
    .toArray((err, docs)=>{
      res.status(200).send(docs);
    })
  })

  app.post('/placeOrder', (req, res) =>{
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const selectedServiceName = req.body.selectedServiceName;
    const description = req.body.description;
    const price = req.body.price;
    const serviceId = req.body.serviceId;
    
    const newImg =file.data
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    placeOrderCollection.insertOne({  name, email, selectedServiceName, description, price, image, serviceId })
    .then(result => {
      res.send(result.insertedCount > 0)
    })

  })

  app.post('/getUserOrderList', (req, res) => {
    const email = req.body.email;
    placeOrderCollection.find({ email: email })
      .toArray((err, docs) => {
        res.status(200).send(docs);
      })
  })

  app.post('/getOrderedServiceList', (req, res) => {
    const serviceId = req.body.serviceId;
    console.log(serviceId)
    serviceCollection.find({ _id: ObjectId(serviceId) })
      .toArray((err, docs) => {
        res.status(200).send(docs);

      })

  });

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })

  app.get('/getReviews', (req, res) => {
    reviewCollection.find({}).limit(6)
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/all-order-list', (req, res) => {
    placeOrderCollection.find({})
      .toArray((err, documents) => {
        res.status(200).send(documents)
      })
  })


  app.post('/addAdmin', (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/getAdmin', (req,res)=> {
    const email = req.query.email;
    adminCollection.find({email: email})
    .toArray((err, documents)=> {
      res.status(200).send(documents)
    })
  })








});

app.listen(process.env.port || port) 