import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Download, FileCopy } from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from './config/api';

const Export = () => {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState('csv');
  const [dataType, setDataType] = useState('payments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.export), {
        params: { type: exportType, dataType },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}_export.${exportType}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccess('Export completed successfully!');
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={() => setOpen(true)}
        sx={{ borderRadius: 2 }}
      >
        Export Data
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Data Export
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select export format and data type
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportType}
                label="Export Format"
                onChange={(e) => setExportType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Data Type</InputLabel>
              <Select
                value={dataType}
                label="Data Type"
                onChange={(e) => setDataType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="payments">Payment Records</MenuItem>
                <MenuItem value="employees">Employee Data</MenuItem>
                <MenuItem value="projects">Project Data</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <FileCopy />}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Export;