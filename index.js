const express = require("express");
const {
  MongoClient,
  ServerApiVersion,
  Collection,
  ObjectId,
  Timestamp,
} = require("mongodb");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const { default: axios } = require("axios");
require("dotenv").config();
const port = process.env.PORT || 9000;
const app = express();

// middle ware
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// const store_id = 'elect671ce752b3f2b';
// const store_passwd = 'elect671ce752b3f2b@ssl';
// const is_live = false;  // Set to `true` for production

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_SECRET_API_KEY}@cluster0.mbvqn67.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("ElectroMart").collection("products");
    const cartCollection = client.db("ElectroMart").collection("carts");
    const userCollection = client.db("ElectroMart").collection("users");
    const compareCollection = client.db("ElectroMart").collection("compares");
    const wishlistCollection = client.db("ElectroMart").collection("wishlist");
    const categoryCollection = client
      .db("ElectroMart")
      .collection("categories");
    const storeCollection = client.db("ElectroMart").collection("stores");
    const promotionCollection = client
      .db("ElectroMart")
      .collection("promotions");
    const reviewCollection = client.db("ElectroMart").collection("reviews");
    // const checkoutCollection = client.db("ElectroMart").collection("order");
    const sliderCollection = client.db("ElectroMart").collection("sliders");
    const rightTopSliderCollection = client
      .db("ElectroMart")
      .collection("rightTopSliders");
    const rightBottomLCollection = client
      .db("ElectroMart")
      .collection("rightBottomLSliders");
    const rightBottomRCollection = client
      .db("ElectroMart")
      .collection("rightBottomRSliders");
    const locationCollection = client.db("ElectroMart").collection("location");
    const paymentHoldingCollection = client
      .db("ElectroMart")
      .collection("paymentHolder");
    const ordersCollection = client.db("ElectroMart").collection("orders");

    // ========================================   product collection start    ========================================
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const ProductData = req.body;
      const result = await productCollection.insertOne(ProductData);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
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
          addDate: updatedProduct.addDate,
        },
      };

      try {
        const result = await productCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ message: "Failed to update product", error });
      }
    });

    app.patch("/productView/:id", async (req, res) => {
      const id = req.params.id;
      const { view } = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          view: view,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.patch("/productQuantity/:id", async (req, res) => {
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
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // Set up the endpoint to get a product by mainProductId
    app.get("/products/:mainProductId", async (req, res) => {
      try {
        const mainProductId = req.params.mainProductId;

        // Make sure the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(mainProductId)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }

        // Find the product by mainProductId in the product collection
        const product = await productCollection.findOne({
          _id: new ObjectId(mainProductId),
        });

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Send the product data as a response
        res.json(product);
        console.log(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product details" });
      }
    });

    // ========================================   product collection end    ========================================

    // =================================== user collection start ===================================
    app.put("/user", async (req, res) => {
      const user = req.body;

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

    app.put("/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const userInfo = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            ...userInfo,
          },
        };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating user:", error);
        res
          .status(500)
          .send({ message: "Error updating user information", error });
      }
    });

    app.patch("/users/update/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email };
      const updateDoc = {
        $set: {
          ...user,
          Timestamp: Date.now(),
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const { subtotal } = req.body;
      const filter = { email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          userSubtotal: subtotal,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //  get a user info by email form db
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // =================================== user collection end ===================================

    // ========================================   cart collection start     ========================================
    app.get("/carts", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const cartProductInfo = req.body;
      const result = await cartCollection.insertOne(cartProductInfo);
      res.send(result);
    });

    app.put("/cart/:id", async (req, res) => {
      const { id } = req.params; // Access ID directly as a string
      const { selectedQuantity, subtotal } = req.body;

      try {
        const result = await cartCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { selectedQuantity, subtotal } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({
          message: "Cart item updated successfully",
          data: { selectedQuantity, subtotal },
        });
      } catch (error) {
        console.error("Failed to update cart item:", error);
        res.status(500).json({ message: "Failed to update cart item", error });
      }
    });

    app.patch("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const { updatedSelectedQuantity, updatedSubtotal } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          selectedQuantity: updatedSelectedQuantity,
          subtotal: updatedSubtotal,
        },
      };
      const result = await cartCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);

      res.send(result);
    });

     // delete auto metic cart when complete order

  // ========================================   cart collection end    ========================================

  // ========================================   compare collection start     ========================================
  app.get("/compares", async (req, res) => {
    const result = await compareCollection.find().toArray();
    res.send(result);
  });

  app.post("/compares", async (req, res) => {
    const CompareProductInfo = req.body;
    const result = await compareCollection.insertOne(CompareProductInfo);
    res.send(result);
  });

  app.delete("/compares/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await compareCollection.deleteOne(query);
    res.send(result);
  });

  // ========================================   Wishlist collection start     ========================================
  app.get("/wishlist", async (req, res) => {
    const result = await wishlistCollection.find().toArray();
    res.send(result);
  });

  app.post("/wishlist", async (req, res) => {
    const WishlistProductInfo = req.body;
    console.log(WishlistProductInfo);
    const result = await wishlistCollection.insertOne(WishlistProductInfo);
    res.send(result);
  });

  app.delete("/wishlist/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await wishlistCollection.deleteOne(query);
    res.send(result);
  });

  // ========================================   Wishlist collection end    ========================================
  // ========================================   category collection start     ========================================
  app.get("/categories", async (req, res) => {
    const result = await categoryCollection.find().toArray();
    res.send(result);
  });

  app.post("/categories", async (req, res) => {
    const updateFormInfo = req.body;
    const result = await categoryCollection.insertOne(updateFormInfo);
    res.send(result);
  });

  app.delete("/categories/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await categoryCollection.deleteOne(query);
    res.send(result);
  });
  // ========================================   category collection end    ========================================

  // ========================================   store collection start     ========================================
  app.get("/stores", async (req, res) => {
    const result = await storeCollection.find().toArray();
    res.send(result);
  });

  app.post("/stores", async (req, res) => {
    const storeInfo = req.body;
    const result = await storeCollection.insertOne(storeInfo);
    res.send(result);
  });

  app.put("/stores/:id", async (req, res) => {
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
        image: storeInfo.image,
      },
    };
    const result = await storeCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  });

  app.delete("/stores/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await storeCollection.deleteOne(query);
    res.send(result);
  });
  // ========================================   store collection end    ========================================

  // ========================================   cart collection start     ========================================
  app.get("/promotions", async (req, res) => {
    const result = await promotionCollection.find().toArray();
    res.send(result);
  });

  app.post("/promotions", async (req, res) => {
    const promotionProductInfo = req.body;
    const result = await promotionCollection.insertOne(promotionProductInfo);
    res.send(result);
  });

  app.delete("/promotions/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await promotionCollection.deleteOne(query);
    res.send(result);
  });
  // ========================================   cart collection end    ========================================

  // ========================================   slider collection end    ========================================
  app.get("/banners", async (req, res) => {
    const result = await sliderCollection.find().toArray();
    res.send(result);
  });

  app.get("/rightTop", async (req, res) => {
    const result = await rightTopSliderCollection.find().toArray();
    res.send(result);
  });

  app.get("/rightBottomL", async (req, res) => {
    const result = await rightBottomLCollection.find().toArray();
    res.send(result);
  });

  app.get("/rightBottomR", async (req, res) => {
    const result = await rightBottomRCollection.find().toArray();
    res.send(result);
  });

  app.post("/banners", async (req, res) => {
    const bannerInfo = req.body;
    const result = await sliderCollection.insertOne(bannerInfo);
    res.send(result);
  });

  app.post("/rightTop", async (req, res) => {
    const bannerInfo = req.body;
    const result = await rightTopSliderCollection.insertOne(bannerInfo);
    res.send(result);
  });

  app.post("/rightBottomL", async (req, res) => {
    const bannerInfo = req.body;
    const result = await rightBottomLCollection.insertOne(bannerInfo);
    res.send(result);
  });

  app.post("/rightBottomR", async (req, res) => {
    const bannerInfo = req.body;
    const result = await rightBottomRCollection.insertOne(bannerInfo);
    res.send(result);
  });

  app.delete("/banners/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await sliderCollection.deleteOne(query);
    res.send(result);
  });

  app.delete("/rightTop/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await rightTopSliderCollection.deleteOne(query);
    res.send(result);
  });

  app.delete("/rightBottomL/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await rightBottomLCollection.deleteOne(query);
    res.send(result);
  });

  app.delete("/rightBottomR/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await rightBottomRCollection.deleteOne(query);
    res.send(result);
  });
  // ========================================   reviews start     ========================================
  app.post("/reviews", async (req, res) => {
    const reviewData = req.body;
    const result = await reviewCollection.insertOne(reviewData);
    res.send(result);
  });

  //  get review data
  app.get("/review", async (req, res) => {
    const result = await reviewCollection.find().toArray();
    res.send(result);
  });

  // ========================================   slider collection end    ========================================

  // ========================================   Checkout page api    ========================================

  //  app.post('/order',async(req,res)=>{
  //   const formData = req.body;
  //   const result = await checkoutCollection.insertOne(formData)
  //   res.send(result)

  //     })

  //  location api
  app.get("/locations", async (req, res) => {
    const result = await locationCollection.find().toArray();
    res.send(result);
  });

  // ========================================   Payment method api SSL E-commerce   ========================================
  //     // create na new id every api call
  //     app.post('/order', async (req, res) => {
  //       const tran_id = Math.floor(10000 + Math.random() * 90000); // Generate a new unique tran_id for each order
  //       const formData = req.body;
  //       const result = await ordersCollection.insertOne(formData);

  //       // console.log(formData);

  //       // Calculate product price
  //       const product = await productCollection.findOne({ _id: new ObjectId(req.body.getProductId) });
  //       // console.log(product);

  //       const data = {
  //           store_id: 'digit66759e8fe463b',
  //           store_passwd: 'digit66759e8fe463b@ssl',
  //           total_amount: formData?.totalAmount,
  //           currency: 'BDT',
  //           tran_id: String(tran_id), // Use the new tran_id for each API call
  //           success_url: `http://localhost:9000/success-payment`,
  //           fail_url: 'http://localhost:9000/fail',
  //           cancel_url: 'http://localhost:9000/cancel',
  //           ipn_url: 'http://localhost:5173/ipn',
  //           shipping_method: 'Courier',
  //           product_name: product?.title,
  //           product_category: product?.category,
  //           product_profile: 'general',
  //           cus_name: formData?.name,
  //           cus_email: formData?.user?.email,
  //           cus_add1: formData?.address,
  //           cus_add2: formData?.district,
  //           cus_city: formData?.city,
  //           cus_state: formData?.division,
  //           cus_postcode: '1000',
  //           cus_country: 'Bangladesh',
  //           cus_phone: formData?.number,
  //           cus_fax: '01711111111',
  //           shipping_method: formData?.shipping,
  //           payment_method: formData.paymentMethod,
  //           ship_add1: 'Dhaka',
  //           ship_add2: 'Dhaka',
  //           ship_city: 'Dhaka',
  //           ship_state: 'Dhaka',
  //           ship_postcode: 1000,
  //           ship_name: 'Courier',
  //           ship_country: 'Bangladesh',
  //       };
  //       console.log(data);

  //       // Post request to sandbox
  //       const response = await axios({
  //           method: "POST",
  //           url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
  //           data: data,
  //           headers: {
  //               "Content-Type": "application/x-www-form-urlencoded"
  //           }
  //       });

  //       // Save payment data with the new tran_id
  //       const saveData = {
  //           cus_name: formData?.name,
  //           cus_phone: formData?.number,
  //           paymentId: String(tran_id),
  //           product_name: product?.title,
  //           cus_email: formData?.user?.email,
  //           product_category: product?.category,
  //           shipping_method: formData?.shipping,
  //           cus_add1: formData?.address,
  //           cus_add2: formData?.district,
  //           cus_city: formData?.city,
  //           cus_state: formData?.division,
  //           payment_method: formData.paymentMethod,
  //           amount: formData?.totalAmount,
  //           status: 'pending'
  //       };

  //       const save = await ordersCollection.insertOne(saveData);
  //       if (save) {
  //           res.send({
  //               paymentUrl: response.data.GatewayPageURL,
  //               result
  //           });
  //       }

  //       console.log(response);
  //   });

  //     // success payment

  //     app.post('/success-payment', async (req, res) => {
  //       const successData = req.body;
  //       if(successData.status !== "VALID"){
  //         throw new Error("unauthorize payment")
  //       }

  //       // update payment status
  //       const query = {
  //         paymentId: String(successData.tran_id), // Ensure matching tran_id type
  //       };
  //       const update={
  //           $set:{
  //             status: 'success'
  //           }
  //       }
  //       const updateData = await paymentCollection.updateOne(query,update)
  //       console.log('success data', successData);
  //       console.log('updateData', updateData);

  //       res.redirect('http://localhost:5173/success')

  //     })
  //     app.post('/success-payment', async (req, res) => {
  //       const successData = req.body;
  //       if (successData.status !== "VALID") {
  //           throw new Error("Unauthorized payment");
  //       }

  //       // Update payment status to 'success'
  //       const query = {
  //           paymentId: String(successData.tran_id), // Match the transaction ID
  //       };
  //       const update = {
  //           $set: {
  //               status: 'success',
  //           },
  //       };
  //       const updateData = await ordersCollection.updateOne(query, update);
  //       console.log('Success data:', successData);
  //       console.log('Update result:', updateData);

  //       // Redirect with the tran_id so frontend can display the specific payment
  //       res.redirect(`http://localhost:5173/success/${successData.tran_id}`);
  //   });
  // // fail payment
  // app.post('/fail', async (req, res) => {
  //   res.redirect('http://localhost:5173/fail')
  // })

  // // cancel payment
  // app.post('/cancel', async (req, res) => {
  //   res.redirect('http://localhost:5173/cancel')
  // })

  // app.get('/payments/:tranId', async (req, res) => {
  //   const tranId = req.params.tranId; // Get tranId from the route params
  //   const payment = await ordersCollection.findOne({ paymentId: tranId }); // Find the payment by transaction ID

  //   if (!payment) {
  //       return res.status(404).send({ message: "No payment found for this transaction." });
  //   }

  //   res.send(payment); // Send the payment details as a response
  // });

  // app.post("/order", async (req, res) => {
  //   const { paymentMethod, ...orderData } = req.body;

  //   console.log("Order Data:", orderData); // Log order data

  //   try {
  //     // Create a new order in the database
  //     const result = await ordersCollection.insertOne(orderData);

  //     if (paymentMethod === "Bkash") {
  //       // Call SSLCommerz to create a payment request
  //       const paymentUrl = await createBkashPayment(
  //         result.insertedId,
  //         orderData.totalAmount
  //       );
  //       return res.json({ paymentUrl });
  //     }

  //     // For Cash on Delivery, respond with success
  //     return res.status(200).json({ message: "Order placed successfully!" });
  //   } catch (error) {
  //     console.error("Order placement error:", error);
  //     return res
  //       .status(500)
  //       .json({ message: "Order placement failed", error });
  //   }
  // });

  // // Function to create a Bkash payment request via SSLCommerz
  // const createBkashPayment = async (orderId, totalAmount) => {
  //   const paymentData = {
  //     // Replace these with your actual SSLCommerz credentials and order details
  //     store_id: process.env.SSL_STORE_ID,
  //     store_passwd: process.env.SSL_STORE_PASSWORD,
  //     total_amount: totalAmount,
  //     currency: "BDT",
  //     transaction_id: `txn_${orderId}`, // Unique transaction ID
  //     success_url: `${process.env.APP_URL}/payment/success`, // URL for success response
  //     fail_url: `${process.env.APP_URL}/payment/fail`, // URL for failure response
  //     cancel_url: `${process.env.APP_URL}/payment/cancel`, // URL for cancellation
  //     product_category: "E-commerce",
  //     product_name: "Order",
  //     product_profile: "general",
  //     shipping_method: "Courier",

  //   };

  //   console.log("Payment Data:", paymentData); // Log the payment data

  //   try {
  //     const response = await axios.post(
  //       "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php",
  //       paymentData
  //     );
  //     console.log("SSLCommerz Response:", response.data); // Log the response from SSLCommerz
  //     return response.data.GatewayPageURL; // Return the payment URL for redirection
  //   } catch (error) {
  //     console.error(
  //       "Payment request error:",
  //       error.response ? error.response.data : error.message
  //     );
  //     throw new Error("Failed to create payment request");
  //   }
  // };

  // Get All Orders Endpoint
  // Endpoint to handle order creation
  app.post("/order", async (req, res) => {
    const tran_id = Math.floor(10000 + Math.random() * 90000); // Generate as a string

    const formData = req.body;
    console.log(formData);

    if (formData.paymentMethod === "cashOnDelivery") {
      // Cash on Delivery: Directly save to ordersCollection
      const saveData = {
        ...formData,
        tran_id: tran_id,
        paymentStatus: "Pending",
        orderStatus: "Processing", // Set initial status for cash orders
      };

      const result = await ordersCollection.insertOne(saveData); // Save order immediately
      return res.send({
        message: "Order placed successfully with Cash on Delivery.",
        result,
      });
    } else if (formData.paymentMethod === "bkash") {
      // Bkash: Setup SSLCommerz payment
      // const product = await productCollection.findOne({
      //   _id: new ObjectId(req.body.getProductId),
      // });
      // console.log("Product",product)
      const saveData = {
        ...formData,
        tran_id: tran_id,
      };

      await paymentHoldingCollection.insertOne(saveData);

      const data = {
        store_id: "digit66759e8fe463b",
        store_passwd: "digit66759e8fe463b@ssl",
        total_amount: formData.totalAmount,
        details: formData,
        currency: "BDT",
        tran_id: tran_id,

        success_url: `http://localhost:9000/success-payment`,
        fail_url: "http://localhost:9000/fail",
        cancel_url: "http://localhost:9000/cancel",
        ipn_url: "http://localhost:5173/ipn",
        product_name: "Demo",
        product_category: "Demo",
        product_profile: "general",
        cus_name: formData.name,
        cus_email: formData.userEmail,
        cus_add1: formData.address,
        cus_phone: formData.number,
        payment_method: formData.paymentMethod,
        shipping_method: formData.shipping,
        ship_country: "Bangladesh",
        cus_name: formData?.name,
        cus_email: formData?.userEmail,
        cus_add1: formData?.address,
        cus_add2: formData?.district,
        cus_city: formData?.city,
        cus_state: formData?.division,
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: formData?.number,
        cus_fax: "01711111111",
        shipping_method: formData?.shipping,
        payment_method: formData.paymentMethod,
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_name: "Courier",
      };

      // Make a request to SSLCommerz for payment initiation
      const response = await axios({
        method: "POST",
        url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        data: data,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("payment url:", response.data);
      // Return the payment URL to frontend for redirection
      return res.send({
        paymentUrl: response.data.GatewayPageURL,
        tran_id,
      });
    } else {
      return res.status(400).send({ message: "Invalid payment method." });
    }
  });

  app.post("/success-payment", async (req, res) => {
    const successData = req.body;

    console.log("SuccessData", successData);

    if (successData.status !== "VALID") {
      return res.status(401).send({ message: "Unauthorized payment" });
    }

    const sTranId = Number(successData.tran_id);

    // Retrieve original order data from tempOrdersCollection
    const originalOrder = await paymentHoldingCollection.findOne({
      tran_id: sTranId,
    });
    // console.log(
    //   "Original order found in paymentHoldingCollection:",
    //   originalOrder
    // );

    if (!originalOrder) {
      return res.status(404).send({ message: "Order not found." });
    }

    // Update the order data for successful payment
    const saveData = {
      ...originalOrder, // Include all original order details
      tran_id: sTranId,
      paymentStatus: "success",
      orderStatus: "Processing", // Mark as successful after payment
    };

    // Save the order information to ordersCollection
    const save = await ordersCollection.insertOne(saveData);

    // Remove from tempOrdersCollection if saved successfully
    if (save) {
      await paymentHoldingCollection.deleteOne({
        tran_id: sTranId,
      });
      res.redirect(`http://localhost:5173/success/${sTranId}`);
    }
  });

  app.get("/orders/:tranId", async (req, res) => {
    const tran_id = Number(req.params.tranId); // Get tran_id from the route params

    // Check if tran_id is missing or invalid
    if (!tran_id) {
      return res.status(400).send({ message: "Transaction ID is required." });
    }

    try {
      // If tran_id is stored as an ObjectId in MongoDB, convert it
      const query = { tran_id: tran_id }; // Adjust this line if tran_id is an ObjectId

      // Fetch order details from the database
      const orderDetails = await ordersCollection.findOne(query);

      // If no order is found, return a 404 error
      if (!orderDetails) {
        return res
          .status(404)
          .send({ message: "No payment found for this transaction." });
      }

      // Send the found order details as a response
      res.send(orderDetails);
      // console.log("OrderDetails:", orderDetails); // Optional: Logging order details
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).send({ message: "Internal server error." });
    }
  });

  // Fail payment handling
  app.post("/fail", async (req, res) => {
    res.redirect("http://localhost:5173/fail");
  });

  // Cancel payment handling
  app.post("/cancel", async (req, res) => {
    res.redirect("http://localhost:5173/cancel");
  });

  app.get("/paymentHolding", async (req, res) => {
    try {
      const orders = await paymentHoldingCollection.find().toArray();
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app.delete("/paymentHolding/:id", async (req, res) => {
    const id = req.params.id; // Get the order ID from the route parameters

    try {
      // Attempt to delete the order from the collection using the provided _id
      const result = await paymentHoldingCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Order deleted successfully!" });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });
  // Delete Order Endpoint
  // Delete Order Endpoint
  app.delete("/orders/:id", async (req, res) => {
    const id = req.params.id; // Get the order ID from the route parameters
    console.log(id)

    try {
      // Attempt to delete the order from the collection using the provided _id
      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Order deleted successfully!" });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });
  app.get("/orders", async (req, res) => {
    const { email } = req.query;

    // Ensure email is provided in the query
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    try {
      // Find orders by matching the email in 'userEmail' field
      const orders = await ordersCollection
        .find({ userEmail: email })
        .toArray();

      // Check if orders are found
      if (orders.length === 0) {
        return res
          .status(404)
          .json({ message: "No orders found for this email" });
      }

      res.json(orders);
      console.log(orders)
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
// Get all orders endpoint
app.get("/allOrders", async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await ordersCollection.find({}).toArray(); 

    // Check if orders are found
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Send the orders back in the response
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

 

// normal get route full server
app.get("/", (req, res) => {
  res.send(`Electro mart server is running form: ${port} port`);
});

app.listen(port, () => {
  console.log(`server running this port: ${port}`);
})}
// Send a ping to confirm a successful connection
  // await client.db("admin").command({ ping: 1 });
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
 
  
}
  

run().catch(console.dir);
