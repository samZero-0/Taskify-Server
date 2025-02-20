const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();    
const port = process.env.PORT || 5000;

app.use(cors(
    {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'https://assignemnt-12.web.app'
            

        ], 
        credentials: true,
    }
));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2nj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

        const database = client.db('Taskify');
        const userCollection = database.collection('users');



        
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.post('/users', async (req, res) => {
            const newUser = req.body;
          
            try {
              
              const existingUser = await userCollection.findOne({ email: newUser.email });
          
              if (existingUser) {
                res.status(200).send({ message: "User already exists", user: existingUser });
              } else {
                
                const result = await userCollection.insertOne(newUser);
                res.status(201).send({ message: "User created successfully", user: result.ops[0] });
              }
            } catch (error) {
              res.status(500).send({ message: "Internal server error", error: error.message });
            }
          });

app.get('/users', async (req, res) => {

            const result = await userCollection.find().toArray();
            res.send(result);
        });

    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Backend connected')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
