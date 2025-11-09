// api/todos.js
import { createRouter } from 'vercel-router';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { uploadToCloudinary, deleteFromCloudinary } from '../../backend/utils/cloudinary.js';
import Todo from '../../backend/models/Todo.js';

dotenv.config();

const router = createRouter();

// Connect to MongoDB (only once)
let connected = false;
async function connectDB() {
  if (!connected) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connected = true;
  }
}

// Todo Model (in-memory import)
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dueDate: { type: Date },
  imageUrl: { type: String },
  pdfUrl: { type: String },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const TodoModel = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// GET all todos
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const todos = await TodoModel.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new todo
router.post('/', async (req, res) => {
  try {
    await connectDB();

    const { text, dueDate, completed } = req.body;
    let imageUrl, pdfUrl;

    // Handle image (base64 or file upload via frontend)
    if (req.files?.image) {
      const file = req.files.image[0];
      imageUrl = await uploadToCloudinary(file.path);
    }

    if (req.files?.pdf) {
      const file = req.files.pdf[0];
      pdfUrl = await uploadToCloudinary(file.path);
    }

    const todo = new TodoModel({ text, dueDate, completed, imageUrl, pdfUrl });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update todo
router.put('/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updates = req.body;

    const todo = await TodoModel.findById(id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    // Delete old files if new ones uploaded
    if (req.files?.image && todo.imageUrl) {
      await deleteFromCloudinary(todo.imageUrl);
    }
    if (req.files?.pdf && todo.pdfUrl) {
      await deleteFromCloudinary(todo.pdfUrl);
    }

    if (req.files?.image) {
      updates.imageUrl = await uploadToCloudinary(req.files.image[0].path);
    }
    if (req.files?.pdf) {
      updates.pdfUrl = await uploadToCloudinary(req.files.pdf[0].path);
    }

    Object.assign(todo, updates);
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE todo
router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const todo = await TodoModel.findById(id);
    if (!todo) return res.status(404).json({ error: 'Not found' });

    if (todo.imageUrl) await deleteFromCloudinary(todo.imageUrl);
    if (todo.pdfUrl) await deleteFromCloudinary(todo.pdfUrl);

    await TodoModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;