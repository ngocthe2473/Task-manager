import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Chip, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import { getUsers, getTeams, getMyTeams, addTeam, searchUsersByEmail } from '../services/apiService';
import PeopleIcon from '@mui/icons-material/People';
import Autocomplete from '@mui/material/Autocomplete';

const Teams = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', members: [] });
  const [createError, setCreateError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching teams data for tab:', tabValue); // Debug log
        
        const userData = await getUsers();
        setUsers(userData);
        console.log('Users data:', userData); // Debug log
          // Fetch teams based on current tab
        let teamsData;
        if (tabValue === 0) {
          // My Teams tab - get user's teams only
          console.log('Calling getMyTeams API...'); // Debug log
          const response = await getMyTeams();
          console.log('getMyTeams response:', response); // Debug log
          teamsData = response.data || response; // Handle both formats
        } else {
          // Other tabs - get all teams
          console.log('Calling getTeams API...'); // Debug log
          const response = await getTeams();
          console.log('getTeams response:', response); // Debug log
          teamsData = response.data || response; // Handle both formats
        }
        
        setTeams(teamsData || []);
        console.log('Final teams set:', teamsData || []); // Debug log
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [tabValue]); // Add tabValue as dependency to refetch when tab changes

  useEffect(() => {
    if (openCreateDialog) {
      getUsers().then(users => setAllUsers(users)).catch(() => setAllUsers([]));
    }
  }, [openCreateDialog]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenCreateDialog = () => {
    setCreateForm({ name: '', description: '', members: [] });
    setCreateError('');
    setSelectedUsers([]);
    setInputValue('');
    setOptions([]);
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setCreateError('');
  };

  const handleCreateTeam = async () => {
    if (!createForm.name.trim()) {
      setCreateError('Team name is required');
      return;
    }
    try {
      await addTeam({ name: createForm.name, description: createForm.description, members: selectedUsers.map(u => u._id) });
      setOpenCreateDialog(false);
      setCreateError('');
      setLoading(true);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create team');
    }
  };

  const handleInviteInputChange = async (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    if (reason === 'input' && newInputValue.length >= 3) {
      setInviteLoading(true);
      try {
        const users = await searchUsersByEmail(newInputValue);
        const merged = [
          ...selectedUsers,
          ...users.filter(u => !selectedUsers.some(su => su._id === u._id))
        ];
        setOptions(merged);
      } catch {
        setOptions(selectedUsers);
      }
      setInviteLoading(false);
    } else if (!newInputValue) {
      setOptions(selectedUsers);
    }
  };

  const handleInviteChange = (event, newValue) => {
    setSelectedUsers(newValue);
    setOptions([
      ...newValue,
      ...options.filter(u => !newValue.some(su => su._id === u._id))
    ]);
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom component="div" sx={{ mb: 0 }}>
          Teams
        </Typography>        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Team
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="My Teams" />
          <Tab label="All Members" />
          <Tab label="Pending Invites" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        loading ? (
          <Box sx={{ textAlign: 'center', py: 5, width: '100%' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading teams...</Typography>
          </Box>
        ) : teams.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, width: '100%' }}>
            <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No teams found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You are not a member of any team yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ mt: 2, borderRadius: '12px', fontWeight: 600 }}
            >
              Create Team
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {teams.map((team) => (
              <Grid item xs={12} md={6} key={team.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom>
                        {team.name}
                      </Typography>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Team Lead:
                    </Typography>
                    {team.members.filter(member => member.id === team.leadId).map(lead => (
                      <Box key={lead.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={lead.avatar} sx={{ mr: 1 }} />
                        <Typography>{lead.name}</Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Members ({team.members.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {team.members.map(member => (
                        <Chip
                          key={member.id}
                          avatar={<Avatar src={member.avatar} />}
                          label={member.name}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                      <Chip
                        icon={<PersonAddIcon />}
                        label="Add Member"
                        onClick={() => setOpenInviteDialog(true)}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<EditIcon />}>Edit Team</Button>
                    <Button size="small" startIcon={<EmailIcon />}>Message All</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}
      
      {tabValue === 1 && (
        loading ? (
          <Box sx={{ textAlign: 'center', py: 5, width: '100%' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading members...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, width: '100%' }}>
            <PersonAddIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No members found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No users available in the system.
            </Typography>
          </Box>
        ) : (
          <Paper sx={{ width: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">All Members</Typography>
              <Button 
                variant="outlined" 
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenInviteDialog(true)}
              >
                Invite User
              </Button>
            </Box>
            
            <List>
              {users.map(user => (
                <ListItem key={user.id} divider>
                  <ListItemAvatar>
                    <Avatar src={user.avatar} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name} 
                    secondary={user.email} 
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={user.id === '1' ? "Admin" : "Member"} 
                      color={user.id === '1' ? "secondary" : "default"} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <IconButton edge="end">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )
      )}
      
      {tabValue === 2 && (
        <Box sx={{ textAlign: 'center', py: 5, width: '100%' }}>
          <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No pending invites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have no pending team invitations.
          </Typography>
        </Box>
      )}
      
      {/* Invite Dialog */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)}>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Role"
            fullWidth
            variant="outlined"
            defaultValue="member"
            SelectProps={{
              native: true,
            }}
          >
            <option value="admin">Admin</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => setOpenInviteDialog(false)} color="primary" variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo team */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            type="text"
            fullWidth
            value={createForm.name}
            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            type="text"
            fullWidth
            multiline
            minRows={2}
            value={createForm.description}
            onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={options}
            value={selectedUsers}
            inputValue={inputValue}
            onInputChange={handleInviteInputChange}
            onChange={handleInviteChange}
            getOptionLabel={option => option.name + (option.email ? ` (${option.email})` : '')}
            filterSelectedOptions
            loading={inviteLoading}
            renderInput={params => (
              <TextField {...params} label="Invite Members by Email" placeholder="Type email..." sx={{ mb: 2 }} />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            sx={{ mb: 2 }}
          />
          {createError && <Typography color="error" sx={{ mb: 1 }}>{createError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
