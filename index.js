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
        const taskCollection = database.collection('tasks');
        // await taskCollection.createIndex({ lastModified: 1 });



        
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

        app.post('/tasks' , async (req,res)=>{
            const newTask = req.body;
            const result = await taskCollection.insertOne(newTask);
            res.send(result);
        })
        
        // Modify the GET tasks endpoint to support polling without requiring an index
        app.get('/tasks', async (req, res) => {
            try {
                // Simply get all tasks and sort them by order
                const result = await taskCollection.find().sort({ order: 1 }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error fetching tasks' });
    }
});
        

        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedTask = req.body;
            const task = {
                $set: {
                    title: updatedTask.title,
                    description: updatedTask.description,
                    category: updatedTask.category,
                    order: updatedTask.order,
                    lastModified: Date.now() // Add timestamp for polling
                }
            };
        
            try {
                const result = await taskCollection.updateOne(filter, task);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error updating task' });
            }
        });


        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })
        app.post('/tasks/update-order', async (req, res) => {
            try {
                const updates = req.body;
                
                // Process each update in sequence
                for (const update of updates) {
                    await taskCollection.updateOne(
                        { _id: new ObjectId(update.taskId) },
                        { $set: { order: update.order, category: update.category } }
                    );
                }
                
                res.status(200).send({ message: 'Task orders updated successfully' });
            } catch (error) {
                console.error('Error updating task orders:', error);
                res.status(500).send({ message: 'Error updating task orders' });
            }
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