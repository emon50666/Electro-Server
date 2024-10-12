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
    const compareCollection = client.db('ElectroMart').collection('compares')
    const categoryCollection = client.db('ElectroMart').collection('categories')



    // ========================================   product collection start    ========================================
    app.get('/products', async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const ProductData = req.body;
      const result = await productCollection.insertOne(ProductData)
      res.send(result)
    })

    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          title: updatedProduct.title,
          shortDescription: updatedProduct.shortDescription,
          fullDescription: updatedProduct.fullDescription,
          images: updatedProduct.images,
          quantity: updatedProduct.quantity,
          brand: updatedProduct.brand,
          category: updatedProduct.category,
          isHot: updatedProduct.isHot,
          isNew: updatedProduct.isNew,
          discountPercentage: updatedProduct.discountPercentage,
          discountPrice: updatedProduct.discountPrice,
          price: updatedProduct.price,
          addDate: updatedProduct.addDate
        },
      };

      try {
        const result = await productCollection.updateOne(filter, updateDoc, options);
        res.send(result);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ message: "Failed to update product", error });
      }
    });


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


    // ========================================   compare collection start     ========================================
    app.get("/compares", async (req, res) => {
      const result = await compareCollection.find().toArray();
      res.send(result)
    })

    app.post('/compares', async (req, res) => {
      const CompareProductInfo = req.body;
      const result = await compareCollection.insertOne(CompareProductInfo)
      res.send(result)
    })

    app.delete("/compares/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await compareCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   compare collection end    ========================================


    // ========================================   category collection start     ========================================
    app.get("/categories", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result)
    })

    app.post('/categories', async (req, res) => {
      const updateFormInfo = req.body;
      const result = await categoryCollection.insertOne(updateFormInfo)
      res.send(result)
    })

    app.delete("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await categoryCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   category collection end    ========================================





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


