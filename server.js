const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://zangranrosten:Zashibis_2015@repetitorstvo.9dg2twn.mongodb.net/test?retryWrites=true&w=majority&appName=Repetitorstvo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
.then(() => {
  console.log('Connected to MongoDB');
  console.log('DB name:', mongoose.connection.name);
  mongoose.connection.db.listCollections().toArray().then(cols => {
    console.log('Collections:', cols.map(c => c.name));
  });
})
.catch(err => console.error('MongoDB connection error:', err));

const studentSchema = new mongoose.Schema({
  id: String,
  name: String,
});

const lessonSchema = new mongoose.Schema({
  id: String,
  studentId: String,
  studentName: String,
  date: String,
  startTime: String,
  endTime: String,
  duration: String,
  amount: String,
  topic: String,
  performance: String,
  tasks: String,
  homework: String,
});

const visitSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  url: String,
  method: String,
  date: String
});

const Student = mongoose.model('Student', studentSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);
const Visit = mongoose.model('Visit', visitSchema);

// Middleware для логирования визитов
app.use(async (req, res, next) => {
  const log = {
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    url: req.originalUrl,
    method: req.method,
    date: new Date().toISOString()
  };
  try {
    await Visit.create(log);
  } catch (e) {
    console.error('Ошибка логирования визита:', e);
  }
  next();
});

// API endpoints
app.get('/api/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: 'Имя ученика обязательно' });
    }
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Ошибка при создании ученика' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Ученик не найден' });
    }
    // await Lesson.deleteMany({ studentId: req.params.id }); // больше не удаляем занятия
    res.json({ message: 'Ученик удален' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Ошибка при удалении ученика' });
  }
});

app.get('/api/lessons', async (req, res) => {
  const lessons = await Lesson.find();
  res.json(lessons);
});

app.post('/api/lessons', async (req, res) => {
  try {
    if (!req.body.studentId || !req.body.date || !req.body.amount) {
      return res.status(400).json({ error: 'Необходимо указать ученика, дату и сумму' });
    }
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Ошибка при создании занятия' });
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const result = await Lesson.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Занятие не найдено' });
    }
    res.json({ message: 'Занятие удалено' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Ошибка при удалении занятия' });
  }
});

// Эндпоинт для просмотра логов с авторизацией по паролю
app.get('/api/visits', async (req, res) => {
  const ADMIN_PASS = 'boy112232'; // Задайте свой пароль здесь
  if (req.query.adminpass !== ADMIN_PASS) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const visits = await Visit.find().sort({ date: -1 }).limit(100);
    res.json(visits);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения логов' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));