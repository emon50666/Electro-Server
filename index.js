const express = require("express")
const { MongoClient, ServerApiVersion, Collection, ObjectId } = require('mongodb');
const cors = require("cors")
const cookieParser = require("cookie-parser");
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()

// middle ware 
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())




const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_SECRET_API_KEY}@cluster0.mbvqn67.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {


  try {
    const productCollection = client.db('ElectroMart').collection('products')
    const cartCollection = client.db('ElectroMart').collection('carts')
    const userCollection = client.db('ElectroMart').collection('users')



    // ========================================   product collection start    ========================================
    app.get('/products', async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const ProductData = req.body;
      console.log(ProductData);
      const result = await productCollection.insertOne(ProductData)
      res.send(result)
    })

    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const { view } = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          view: view,
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   product collection end    ========================================


    // =================================== user collection start ===================================
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })
    // =================================== user collection end ===================================


    // ========================================   cart collection start     ========================================
    app.get("/carts", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const cartProductInfo = req.body;
      console.log(cartProductInfo);
      const result = await cartCollection.insertOne(cartProductInfo)
      res.send(result)
    })

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   cart collection end    ========================================









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// normal get route full server
app.get('/', (req, res) => {
  res.send(`Electro mart server is running form: ${port} port`)
})

app.listen(port, () => {
  console.log(`server running this port: ${port}`);

})


