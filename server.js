const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 5000;

app.use(express.json());

const mongoHost = process.env.MONGO_HOST || 'mongodb-service';
const mongoUrl = `mongodb://${mongoHost}:27017`;
let db;

async function connectDB() {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db('todoDB');
    console.log('Connected to MongoDB');
}
connectDB().catch(console.error);

app.get('/todos', async (req, res) => {
    const todos = await db.collection('todos').find().toArray();
    res.json(todos);
});

app.post('/todos', async (req, res) => {
    const todo = req.body;
    const result = await db.collection('todos').insertOne(todo);
    res.status(201).json({ id: result.insertedId, ...todo });
});

app.get('/todos/:id', async (req, res) => {
    try {
        const todo = await db.collection('todos').findOne({ _id: new ObjectId(req.params.id) });
        if (todo) res.json(todo);
        else res.status(404).json({ error: 'Todo not found' });
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

app.put('/todos/:id', async (req, res) => {
    try {
        const result = await db.collection('todos').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        if (result.matchedCount > 0) res.json({ message: 'Todo updated' });
        else res.status(404).json({ error: 'Todo not found' });
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

app.delete('/todos/:id', async (req, res) => {
    try {
        const result = await db.collection('todos').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount > 0) res.json({ message: 'Todo deleted' });
        else res.status(404).json({ error: 'Todo not found' });
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

app.listen(port, () => {
    console.log(`Todo app listening on port ${port}`);
});
