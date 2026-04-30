import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { Search as SearchIcon, Close } from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from './config/api';

const Search = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.search), {
        params: { query, type: searchType },
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'all') {
      return (
        <Box sx={{ mt: 2 }}>
          {results.results.payments.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Payment Records ({results.results.payments.length})
              </Typography>
              <List dense>
                {results.results.payments.slice(0, 5).map((payment, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={`${payment.projectName} - ${payment.ownerName}`}
                      secondary={`Unit: ${payment.unitNo}, Date: ${payment.date}`}
                    />
                  </ListItem>
                ))}
                {results.results.payments.length > 5 && (
                  <ListItem>
                    <Typography variant="caption" color="text.secondary">
                      ... and {results.results.payments.length - 5} more
                    </Typography>
                  </ListItem>
                )}
              </List>
            </>
          )}

          {results.results.employees.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Employees ({results.results.employees.length})
              </Typography>
              <List dense>
                {results.results.employees.slice(0, 5).map((employee, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={`${employee.name} (${employee.code})`}
                      secondary={employee.number}
                    />
                  </ListItem>
                ))}
                {results.results.employees.length > 5 && (
                  <ListItem>
                    <Typography variant="caption" color="text.secondary">
                      ... and {results.results.employees.length - 5} more
                    </Typography>
                  </ListItem>
                )}
              </List>
            </>
          )}

          {results.results.projects.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Projects ({results.results.projects.length})
              </Typography>
              <List dense>
                {results.results.projects.slice(0, 5).map((project, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={project.name}
                      secondary={project.description || project.location}
                    />
                  </ListItem>
                ))}
                {results.results.projects.length > 5 && (
                  <ListItem>
                    <Typography variant="caption" color="text.secondary">
                      ... and {results.results.projects.length - 5} more
                    </Typography>
                  </ListItem>
                )}
              </List>
            </>
          )}
        </Box>
      );
    }

    // Handle specific search types
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Results ({results.results.length})
        </Typography>
        <List dense>
          {results.results.slice(0, 10).map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  searchType === 'payments' ? `${item.projectName} - ${item.ownerName}` :
                  searchType === 'employees' ? `${item.name} (${item.code})` :
                  item.name
                }
                secondary={
                  searchType === 'payments' ? `Unit: ${item.unitNo}, Date: ${item.date}` :
                  searchType === 'employees' ? item.number :
                  item.description || item.location
                }
              />
            </ListItem>
          ))}
          {results.results.length > 10 && (
            <ListItem>
              <Typography variant="caption" color="text.secondary">
                ... and {results.results.length - 10} more
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
    );
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={() => setOpen(true)}
        sx={{ 
          borderRadius: 2,
          fontWeight: 600,
          bgcolor: 'rgba(15, 118, 110, 0.1)',
          color: 'primary.main',
          border: '1px solid',
          borderColor: 'primary.light',
          px: 3,
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'white'
          }
        }}
      >
        Search
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontFamily: 'Cinzel, serif',
          fontWeight: 700,
          letterSpacing: '0.05em'
        }}>
          ADVANCED SEARCH
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Search across all data or specific categories
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for projects, employees, payments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              sx={{ borderRadius: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              sx={{ borderRadius: 2, minWidth: '120px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'payments', label: 'Payments' },
              { id: 'employees', label: 'Employees' },
              { id: 'projects', label: 'Projects' }
            ].map((type) => (
              <Chip
                key={type.id}
                label={type.label}
                onClick={() => setSearchType(type.id)}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 600,
                  bgcolor: searchType === type.id ? 'primary.main' : 'rgba(15, 118, 110, 0.05)',
                  color: searchType === type.id ? 'white' : 'primary.main',
                  '&:hover': { bgcolor: searchType === type.id ? 'primary.dark' : 'rgba(15, 118, 110, 0.1)' }
                }}
              />
            ))}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {results && renderResults()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Search;