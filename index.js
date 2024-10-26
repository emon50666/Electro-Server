const express = require("express")
const { MongoClient, ServerApiVersion, Collection, ObjectId, Timestamp } = require('mongodb');
const cors = require("cors")
const cookieParser = require("cookie-parser");
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()

// middle ware 
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://dulcet-biscotti-e5c144.netlify.app'],
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
    const wishlistCollection = client.db('ElectroMart').collection('wishlist')
    const categoryCollection = client.db('ElectroMart').collection('categories')
    const storeCollection = client.db('ElectroMart').collection('stores')
    const promotionCollection = client.db('ElectroMart').collection('promotions')
    const reviewCollection = client.db('ElectroMart').collection('reviews')
    const checkoutCollection = client.db('ElectroMart').collection('checkout')
    const sliderCollection = client.db('ElectroMart').collection('sliders')
    const rightTopSliderCollection = client.db('ElectroMart').collection('rightTopSliders')
    const rightBottomLCollection = client.db('ElectroMart').collection('rightBottomLSliders')
    const rightBottomRCollection = client.db('ElectroMart').collection('rightBottomRSliders')
    const locationCollection = client.db('ElectroMart').collection('location')





    // ========================================   product collection start    ========================================
    app.get('/products', async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query);
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


    app.patch('/productView/:id', async (req, res) => {
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


    app.patch('/productQuantity/:id', async (req, res) => {
      const id = req.params.id;
      const { updatedQuantity } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: updatedQuantity,
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   product collection end    ========================================

    // app.get('/products/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await productCollection.findOne(query);
    //   res.send(result)

    // })





    // =================================== user collection start ===================================
    app.put('/user', async (req, res) => {
      const user = req.body;
      console.log("User Data Received:", user); // Check what is being sent from the frontend

      if (!user || !user.email) {
        return res.status(400).send({ error: "Invalid user data" });
      }

      const query = { email: user.email };
      const isExist = await userCollection.findOne(query);
      if (isExist) return res.send(isExist);

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
          Timestamp: Date.now(),
        },
      };
      const result = await userCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.put('/user/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const userInfo = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            ...userInfo,
          }
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result);
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Error updating user information', error });
      }
    });
  



    // update user role 
    app.patch('/users/update/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email };
      const updateDoc = {
        $set: {
          ...user,
          Timestamp: Date.now()
        }
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })



    //  get a user info by email form db
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email })
      res.send(result)
    })

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



    // ========================================   Wishlist collection start     ========================================
    app.get("/wishlist", async (req, res) => {
      const result = await wishlistCollection.find().toArray();
      res.send(result)
    })

    app.post('/wishlist', async (req, res) => {
      const WishlistProductInfo = req.body;
      console.log(WishlistProductInfo);
      const result = await wishlistCollection.insertOne(WishlistProductInfo)
      res.send(result)
    })

    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await wishlistCollection.deleteOne(query);
      res.send(result)
    })


    // ========================================   Wishlist collection end    ========================================
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

    // ========================================   store collection start     ========================================
    app.get("/stores", async (req, res) => {
      const result = await storeCollection.find().toArray();
      res.send(result)
    })

    app.post('/stores', async (req, res) => {
      const storeInfo = req.body;
      const result = await storeCollection.insertOne(storeInfo)
      res.send(result)
    })

    app.put('/stores/:id', async (req, res) => {
      const id = req.params.id;
      const storeInfo = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          shopName: storeInfo.shopName,
          shopAddress: storeInfo.shopAddress,
          shopContactNumber: storeInfo.shopContactNumber,
          shortDescription: storeInfo.shortDescription,
          operatingHours: storeInfo.operatingHours,
          image: storeInfo.image
        },
      };
      const result = await storeCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete("/stores/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await storeCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   store collection end    ========================================

    // ========================================   cart collection start     ========================================
    app.get("/promotions", async (req, res) => {
      const result = await promotionCollection.find().toArray();
      res.send(result)
    })

    app.post('/promotions', async (req, res) => {
      const promotionProductInfo = req.body;
      const result = await promotionCollection.insertOne(promotionProductInfo)
      res.send(result)
    })

    app.delete("/promotions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await promotionCollection.deleteOne(query);
      res.send(result)
    })
    // ========================================   cart collection end    ========================================



    // ========================================   slider collection end    ========================================
    app.get('/banners', async (req, res) => {
      const result = await sliderCollection.find().toArray();
      res.send(result);
    })

    app.get('/rightTop', async (req, res) => {
      const result = await rightTopSliderCollection.find().toArray();
      res.send(result);
    })

    app.get('/rightBottomL', async (req, res) => {
      const result = await rightBottomLCollection.find().toArray();
      res.send(result);
    })

    app.get('/rightBottomR', async (req, res) => {
      const result = await rightBottomRCollection.find().toArray();
      res.send(result);
    })

    app.post('/banners', async (req, res) => {
      const bannerInfo = req.body;
      const result = await sliderCollection.insertOne(bannerInfo);
      res.send(result);
    })

    app.post('/rightTop', async (req, res) => {
      const bannerInfo = req.body;
      const result = await rightTopSliderCollection.insertOne(bannerInfo);
      res.send(result);
    })

    app.post('/rightBottomL', async (req, res) => {
      const bannerInfo = req.body;
      const result = await rightBottomLCollection.insertOne(bannerInfo);
      res.send(result);
    })

    app.post('/rightBottomR', async (req, res) => {
      const bannerInfo = req.body;
      const result = await rightBottomRCollection.insertOne(bannerInfo);
      res.send(result);
    })

    app.delete('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await sliderCollection.deleteOne(query);
      res.send(result);
    })

    app.delete('/rightTop/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await rightTopSliderCollection.deleteOne(query);
      res.send(result);
    })

    app.delete('/rightBottomL/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await rightBottomLCollection.deleteOne(query);
      res.send(result);
    })

    app.delete('/rightBottomR/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await rightBottomRCollection.deleteOne(query);
      res.send(result);
    })
    // ========================================   reviews start     ========================================
    app.post('/reviews', async (req, res) => {
      const reviewData = req.body;
      const result = await reviewCollection.insertOne(reviewData)
      res.send(result)
    })

    app.post('/reviews', async (req, res) => {
      const reviewData = req.body;
      const result = await reviewCollection.insertOne(reviewData)
      res.send(result)
    })

    //  get review data 
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result)
    })
    //  get review data 
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result)
    })

    // ========================================   slider collection end    ========================================


    // ========================================   Checkout page api    ========================================

 app.post('/checkout',async(req,res)=>{
  const formData = req.body;
  const result = await checkoutCollection.insertOne(formData)
  res.send(result)

    })

    //  location api 
    app.get('/locations',async(req,res)=>{
      const result = await locationCollection.find().toArray();
      res.send(result)

    })









    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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


