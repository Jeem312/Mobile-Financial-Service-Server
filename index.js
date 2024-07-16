const express = require('express');
require('dotenv').config();

const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 7000;
const { MongoClient, ServerApiVersion } = require('mongodb');
// Middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wibgfjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection = client.db("FinMob").collection('users');





    app.post('/register', async (req, res) => {
        const { 
          name,
          email
          , pin
          ,role,balance,status } = req.body;
        const hashedPassword = await bcrypt.hash(pin, 10);
        const newUser = { name, email, pin: hashedPassword,role,balance, status};
        
        try {
          await userCollection.insertOne(newUser);
          res.status(201).json({ message: 'registered successfully' });
        } catch (error) {
          res.status(500).json({ message: 'Error registering user' });
        }
      });

      app.post('/login', async (req, res) => {
        const { email, pin } = req.body;
        const user = await userCollection.findOne({ email });
        
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }
      
        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
      
        const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: '365d' });
        res.json({ success: true, token });
      });
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, world!');
  });
  
app.listen(port, () => {
  console.log(`'Server is running on port:' ${port}`);
});