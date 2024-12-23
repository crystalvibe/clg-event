import React, { useState } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { addCategory, addEventType, getAllCategories, getAllEventTypes } from '../utils/indexedDB';
import { useEffect } from 'react';

const AdminSettings = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openEventTypeDialog, setOpenEventTypeDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedCategories = await getAllCategories();
    const loadedEventTypes = await getAllEventTypes();
    setCategories(loadedCategories);
    setEventTypes(loadedEventTypes);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await addCategory(newCategory.trim());
      setNewCategory('');
      setOpenCategoryDialog(false);
      await loadData();
    }
  };

  const handleAddEventType = async () => {
    if (newEventType.trim()) {
      await addEventType(newEventType.trim());
      setNewEventType('');
      setOpenEventTypeDialog(false);
      await loadData();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Settings</Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Categories</Typography>
        <List>
          {categories.map((category) => (
            <ListItem key={category}>{category}</ListItem>
          ))}
        </List>
        <Button variant="contained" onClick={() => setOpenCategoryDialog(true)}>
          Add Category
        </Button>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>Event Types</Typography>
        <List>
          {eventTypes.map((type) => (
            <ListItem key={type}>{type}</ListItem>
          ))}
        </List>
        <Button variant="contained" onClick={() => setOpenEventTypeDialog(true)}>
          Add Event Type
        </Button>
      </Box>

      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCategory}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEventTypeDialog} onClose={() => setOpenEventTypeDialog(false)}>
        <DialogTitle>Add New Event Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Type Name"
            fullWidth
            value={newEventType}
            onChange={(e) => setNewEventType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventTypeDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEventType}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings; 