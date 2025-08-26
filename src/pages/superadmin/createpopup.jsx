import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'; // Import dayjs for date handling

// This component will be your reusable popup for creating surveys
export default function CreatePopup({ open, onClose, onSubmit }) {
  const [surveyName, setSurveyName] = useState('');
  const [startDate, setStartDate] = useState(null); // dayjs object or null
  const [endDate, setEndDate] = useState(null); // dayjs object or null

  // Handler for the submit button
  const handleSubmit = () => {
    // Basic validation
    if (!surveyName.trim()) {
      alert('Please fill the survey name.'); // Using alert for simplicity, consider MUI Snackbar for production
      return;
    }
    if (!startDate) {
      alert('Please fill the Start date.'); // Using alert for simplicity, consider MUI Snackbar for production
      return;
    }
    if (!endDate) {
      alert('Please fill the End date.'); // Using alert for simplicity, consider MUI Snackbar for production
      return;
    }

    if (endDate.isBefore(startDate)) {
      alert('End Date cannot be before Start Date.');
      return;
    }

    const surveyData = {
      surveyName: surveyName.trim(),
      startDate: startDate.format('YYYY-MM-DD'), // Format date as string for submission
      endDate: endDate.format('YYYY-MM-DD'),     // Format date as string for submission
    };

    // Call the onSubmit prop with the survey data
    if (onSubmit) {
      onSubmit(surveyData);
    }

    // Close the dialog and reset form fields
    onClose();
    setSurveyName('');
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: '#a9e7e5', color: '#333', textAlign: 'center', p: 2 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Create New Survey
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Survey Name"
          type="text"
          fullWidth
          variant="outlined"
          value={surveyName}
          onChange={(e) => {
            // This regex removes any character that is NOT a letter or a number
            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
            setSurveyName(sanitizedValue);
          }}
          sx={{ borderRadius: 2 }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
            sx={{ borderRadius: 2 }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
            sx={{ borderRadius: 2 }}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: '#f0f0f0' }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ borderRadius: 2, px: 3 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ borderRadius: 2, px: 3 }}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}