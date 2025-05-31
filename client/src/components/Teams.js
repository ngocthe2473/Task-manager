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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import { getUsers } from '../services/fakeDatabaseService';

const Teams = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Group users into teams for demo purposes
  const teams = [
    {
      id: 1,
      name: 'Development Team',
      members: users.filter(user => user.id === '1' || user.id === '3' || user.id === '5'),
      description: 'Responsible for creating and maintaining software applications',
      leadId: '1'
    },
    {
      id: 2,
      name: 'Design Team',
      members: users.filter(user => user.id === '2' || user.id === '4'),
      description: 'Focused on user experience and interface design',
      leadId: '2'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom component="div" sx={{ mb: 0 }}>
          Teams
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
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
      )}
      
      {tabValue === 1 && (
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
      )}
      
      {tabValue === 2 && (
        <Paper sx={{ width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>No pending invites</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Invite new team members to collaborate on your projects
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenInviteDialog(true)}
          >
            Invite User
          </Button>
        </Paper>
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
            <option value="manager">Manager</option>
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
    </Box>
  );
};

export default Teams;
