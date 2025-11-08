import React, { useState } from 'react';
import {
  Card, CardContent, Typography, CardActions, Checkbox,
  IconButton, Box
} from '@mui/material';
import { Edit, Delete, PictureAsPdf } from '@mui/icons-material';
import TodoForm from './TodoForm';

function TodoList({ todos, onUpdate, onDelete, onToggleComplete }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setEditOpen(true);
  };

  const handleEditSubmit = (updates, image, pdf) => {  
    onUpdate(editingTodo._id, updates, image, pdf);
    setEditOpen(false);
  };

  return (
    <>
      {todos.map((todo) => (
        <Card key={todo._id} sx={{ mb: 2, opacity: todo.completed ? 0.6 : 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Checkbox
                checked={todo.completed}
                onChange={() => onToggleComplete(todo._id)}
              />
              <Typography variant="h6" sx={{ flexGrow: 1, textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.text}
              </Typography>
            </Box>
            {todo.dueDate && (
              <Typography variant="body2" color="text.secondary">
                Due: {new Date(todo.dueDate).toLocaleString()}
              </Typography>
            )}
            {todo.imageUrl && (
              <img src={todo.imageUrl} alt="Todo" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, mt: 1 }} />
            )}
            {todo.pdfUrl && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <IconButton href={todo.pdfUrl} target="_blank" rel="noopener noreferrer" size="small">
                  <PictureAsPdf color="primary" />
                </IconButton>
                <Typography variant="body2" color="text.primary">
                  📄 PDF Attached
                </Typography>
              </Box>
            )}
          </CardContent>
          <CardActions>
            <IconButton onClick={() => handleEdit(todo)}><Edit /></IconButton>
            <IconButton onClick={() => onDelete(todo._id)}><Delete /></IconButton>
          </CardActions>
        </Card>
      ))}
      <TodoForm
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingTodo(null); }}
        onSubmit={handleEditSubmit}
        initialData={editingTodo}
      />
    </>
  );
}

export default TodoList;