import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' }
];

const Profile = () => {
  const { userInfo, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });
        if (!res.ok) throw new Error('Không thể lấy thông tin người dùng');
        const data = await res.json();
        setProfile(data);
        setEditData({
          name: data.name || '',
          email: data.email || '',
          language: data.language || 'vi',
          role: data.role || '',
          avatar: data.avatar || ''
        });
        setAvatarPreview(data.avatar || '');
        updateUser(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Ảnh quá lớn (tối đa 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setEditData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');

      setProfile(data);
      updateUser(data);
      setSuccess('Cập nhật thành công!');
      if (data.avatar) setAvatarPreview(data.avatar);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Cài đặt hồ sơ</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={avatarPreview} alt={editData.name} sx={{ width: 80, height: 80, mr: 3 }}>
            {editData.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {editData.name} <span style={{ color: '#888', fontSize: 16 }}>• {editData.role}</span>
            </Typography>
            <Button onClick={handlePhotoClick} startIcon={<PhotoCamera />} sx={{ mt: 1 }}>
              Đổi ảnh đại diện
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Họ và tên"
            name="name"
            value={editData.name}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Email"
            name="email"
            value={editData.email}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            select
            label="Ngôn ngữ"
            name="language"
            value={editData.language}
            onChange={handleChange}
            fullWidth
          >
            {LANGUAGES.map(lang => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Vai trò"
            name="role"
            value={editData.role}
            disabled
            fullWidth
          />
        </Box>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile;
