import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add as AddIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import axios from 'axios';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [todos, setTodos] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  };

  const handleAddTodo = async (todoData, imageFile, pdfFile) => {
    const formData = new FormData();
    formData.append('text', todoData.text);
    if (todoData.dueDate) formData.append('dueDate', todoData.dueDate);
    formData.append('completed', todoData.completed);

    try {
      let imageUrl, pdfUrl;

      if (imageFile) {
        const imgData = new FormData();
        imgData.append('file', imageFile);
        imgData.append('upload_preset', 'your_unsigned_preset'); // Create in Cloudinary
        const imgRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: imgData }
        );
        const imgJson = await imgRes.json();
        imageUrl = imgJson.secure_url;
      }

      if (pdfFile) {
        const pdfData = new FormData();
        pdfData.append('file', pdfFile);
        pdfData.append('upload_preset', 'your_unsigned_preset');
        const pdfRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/raw/upload`,
          { method: 'POST', body: pdfData }
        );
        const pdfJson = await pdfRes.json();
        pdfUrl = pdfJson.secure_url;
      }

      if (imageUrl) formData.append('imageUrl', imageUrl);
      if (pdfUrl) formData.append('pdfUrl', pdfUrl);

      const res = await axios.post('/api/todos', Object.fromEntries(formData));
      setTodos([...todos, res.data]);
      setOpenForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTodo = async (id, updates, imageFile, pdfFile) => {
    try {
      const formData = new FormData();
      Object.keys(updates).forEach(key => formData.append(key, updates[key]));
      if (imageFile) formData.append('image', imageFile);
      if (pdfFile) formData.append('pdf', pdfFile);

      const res = await axios.put(`/api/todos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (todo) {
      await handleUpdateTodo(id, { completed: !todo.completed });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My TODO App
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton onClick={() => setOpenForm(true)} color="inherit">
              <AddIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Box sx={{ minHeight: '80vh' }}>
            <TodoList
              todos={todos}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onToggleComplete={toggleComplete}
            />
          </Box>
        </Container>
        <TodoForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleAddTodo}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;