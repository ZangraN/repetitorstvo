const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://zangranrosten:Zashibis_2015@repetitorstvo.9dg2twn.mongodb.net/?retryWrites=true&w=majority&appName=Repetitorstvo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const studentSchema = new mongoose.Schema({
  id: String,
  name: String,
});

const lessonSchema = new mongoose.Schema({
  id: String,
  studentId: String,
  date: String,
  amount: String,
  topic: String,
  performance: String,
  tasks: String,
  homework: String,
});

const Student = mongoose.model('Student', studentSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

// API endpoints
app.get('/api/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

app.delete('/api/students/:id', async (req, res) => {
  await Student.findOneAndDelete({ id: req.params.id });
  await Lesson.deleteMany({ studentId: req.params.id });
  res.json({ message: 'Student deleted' });
});

app.get('/api/lessons', async (req, res) => {
  const lessons = await Lesson.find();
  res.json(lessons);
});

app.post('/api/lessons', async (req, res) => {
  const lesson = new Lesson(req.body);
  await lesson.save();
  res.json(lesson);
});

app.delete('/api/lessons/:id', async (req, res) => {
  await Lesson.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'Lesson deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));