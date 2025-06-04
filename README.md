# Task Manager - Hệ thống Quản lý Công việc

## Giới thiệu
Task Manager là một ứng dụng web toàn diện để quản lý công việc, dự án và nhóm làm việc. Được xây dựng với **React.js 18** (frontend) và **Node.js với Express** (backend), sử dụng **MongoDB Atlas** làm cơ sở dữ liệu.

## Tính năng chính
- ✅ **Quản lý nhiệm vụ**: Tạo, chỉnh sửa, xóa, cập nhật trạng thái với Kanban board
- 👥 **Quản lý nhóm**: Tạo team, thêm/xóa thành viên, phân quyền role
- 📊 **Dashboard**: Thống kê chi tiết với biểu đồ, progress tracking
- 📅 **Lịch công việc**: Calendar view với events và deadlines
- 🔐 **Xác thực bảo mật**: JWT authentication, role-based access control
- 💬 **Hệ thống bình luận**: Comment real-time trên tasks
- 📁 **Quản lý dự án**: Project management với milestones
- 🔍 **Tìm kiếm nâng cao**: Search và filter đa tiêu chí
- 📱 **Responsive design**: Material-UI với UX/UI hiện đại
- 📊 **Báo cáo**: Reports và analytics chi tiết
- � **Thông báo**: Notification system
- ⏰ **Time tracking**: Ghi nhận thời gian làm việc

## Công nghệ sử dụng
### Frontend
- React.js 18 + Hooks
- Material-UI (MUI) v5
- React Router v6
- Axios cho API calls
- React Context cho state management

### Backend
- Node.js + Express.js
- MongoDB Atlas với Mongoose ODM
- JWT cho authentication
- Bcrypt cho password hashing
- Multer cho file uploads
- Express rate limiting

## Yêu cầu hệ thống
- **Node.js** (phiên bản 16.0 trở lên)
- **MongoDB Atlas** account (miễn phí)
- **npm** hoặc **yarn**
- **Git**
- **Web browser** hiện đại (Chrome, Firefox, Safari, Edge)

## Cài đặt và chạy ứng dụng

### Bước 1: Clone repository
```bash
git clone https://github.com/your-username/Task-manager.git
cd Task-manager
git checkout Ma-con-cho
```

### Bước 2: Cài đặt dependencies cho Backend
```bash
# Từ thư mục gốc của project
npm install
```

### Bước 3: Cài đặt dependencies cho Frontend
```bash
cd client
npm install
cd ..
```

### Bước 4: Cấu hình môi trường
Tạo file `.env` trong thư mục gốc với nội dung:
```env
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5000

# Client URL (cho CORS)
CLIENT_URL=http://localhost:3001

# Email Configuration (tùy chọn)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Bước 5: Tạo dữ liệu mẫu (Atlas Massive)
```bash
# Chạy script tạo dữ liệu mẫu lớn cho MongoDB Atlas
node scripts/seedAtlas_massive.js

# Hoặc tạo dữ liệu cơ bản
node seed.js

# Hoặc tạo dữ liệu teams
node seedTeams.js
```

### Bước 6: Chạy ứng dụng

#### Chạy Backend và Frontend riêng biệt:
```bash
# Terminal 1 - Chạy Backend (từ thư mục gốc)
npm start
# Backend sẽ chạy trên http://localhost:5000

# Terminal 2 - Chạy Frontend (từ thư mục gốc)
cd client
npm start
# Frontend sẽ chạy trên http://localhost:3001
```

#### Hoặc chạy cả hai cùng lúc:
```bash
# Từ thư mục gốc
npm run dev
```

## Cấu trúc dự án
```
Task-manager/
├── client/                 # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   └── package.json
├── config/                 # Backend configuration
├── controllers/            # Route controllers
├── middleware/             # Express middleware
├── models/                 # MongoDB models
├── routes/                 # API routes
├── scripts/                # Utility scripts
├── tests/                  # Test files
├── server.js              # Main server file
├── package.json           # Backend dependencies
└── README.md              # This file
```

## API Endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Tasks
- `GET /api/tasks` - Lấy danh sách công việc
- `POST /api/tasks` - Tạo công việc mới
- `PUT /api/tasks/:id` - Cập nhật công việc
- `DELETE /api/tasks/:id` - Xóa công việc

### Teams
- `GET /api/teams` - Lấy danh sách nhóm
- `POST /api/teams` - Tạo nhóm mới
- `PUT /api/teams/:id` - Cập nhật nhóm
- `DELETE /api/teams/:id` - Xóa nhóm

### Projects
- `GET /api/projects` - Lấy danh sách dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án

### Calendar
- `GET /api/calendar/tasks` - Lấy công việc theo lịch

## Tài khoản mặc định
Sau khi seed dữ liệu, bạn có thể đăng nhập với:
- **Admin**: admin@taskmanager.com / password123
- **Project Manager**: pm@taskmanager.com / password123
- **Team Leader**: teamlead@taskmanager.com / password123
- **Developer**: dev@taskmanager.com / password123
- **Designer**: designer@taskmanager.com / password123

## Testing
```bash
# Chạy tests backend
npm test

# Test với coverage
npm run test:coverage

# Test frontend
cd client && npm test
```

## Kiểm tra Postman
File `Task-Manager-API.postman_collection.json` chứa các API endpoints để test với Postman. Import file này vào Postman để test các API endpoints.

## Troubleshooting

### Lỗi thường gặp:

1. **MongoDB Atlas connection error**:
   - Kiểm tra connection string trong `.env`
   - Đảm bảo IP address được whitelist trong MongoDB Atlas
   - Kiểm tra username/password chính xác

2. **Port already in use**:
   - Thay đổi port trong `.env` hoặc kill process đang dùng port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID [PID_NUMBER] /F
   
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   ```

3. **CORS errors**:
   - Kiểm tra CLIENT_URL trong `.env` khớp với port frontend
   - Đảm bảo backend chạy trước frontend

4. **Missing dependencies**:
   ```bash
   # Cài đặt lại dependencies
   npm install
   cd client && npm install && cd ..
   ```

5. **JWT Token errors**:
   - Kiểm tra JWT_SECRET trong `.env`
   - Clear localStorage trong browser và đăng nhập lại

6. **Frontend build errors**:
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

## Deployment

### MongoDB Atlas Setup
1. Tạo tài khoản miễn phí tại [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo cluster mới
3. Whitelist IP address (0.0.0.0/0 cho development)
4. Tạo database user và lấy connection string
5. Thay thế MONGODB_URI trong `.env`

### Heroku Deployment
```bash
# Cài đặt Heroku CLI
heroku create task-manager-app
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set CLIENT_URL=https://your-app.herokuapp.com
git push heroku Ma-con-cho:main
```

### Vercel (Frontend) + Railway (Backend)
```bash
# Deploy frontend to Vercel
cd client
npm run build
# Connect to Vercel và deploy

# Deploy backend to Railway
# Connect GitHub repo to Railway
```

## Tính năng nổi bật

### 1. Dashboard Analytics
- Biểu đồ thống kê tasks theo trạng thái
- Progress tracking theo dự án
- Productivity metrics
- Team performance overview

### 2. Advanced Task Management
- Kanban board với drag & drop
- Task dependencies
- Subtasks và checklist
- File attachments
- Time tracking và estimates

### 3. Team Collaboration
- Real-time comments
- @mention notifications
- Activity logs
- Team chat (planned)

### 4. Calendar Integration
- Task deadlines view
- Project milestones
- Team schedules
- Export to Google Calendar (planned)

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-app.herokuapp.com/api`

### Authentication Required
Most endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

## Đóng góp
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Tech Stack Chi tiết

### Frontend Dependencies
```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x", 
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "@mui/x-charts": "^6.x"
}
```

### Backend Dependencies
```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x",
  "multer": "^1.x",
  "cors": "^2.x"
}
```

## Performance & Security

### Security Features
- JWT-based authentication
- Password hashing với bcrypt
- Rate limiting cho API endpoints
- Input validation và sanitization
- CORS configuration
- MongoDB injection prevention

### Performance Optimizations
- Database indexing cho queries nhanh
- Image compression cho uploads
- Lazy loading cho components
- API response caching
- Bundle splitting cho frontend

## License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 📚 Ghi chú cho giảng viên

### Thông tin dự án
- **Nhánh chính**: `Ma-con-cho` 
- **Thời gian phát triển**: 3 tháng
- **Số lượng components**: 20+ React components
- **API endpoints**: 50+ REST APIs
- **Database collections**: 10+ MongoDB collections

### Highlights kỹ thuật
- ✅ Full-stack MERN application
- ✅ Responsive design với Material-UI
- ✅ JWT authentication & authorization
- ✅ RESTful API design
- ✅ MongoDB với relationship modeling
- ✅ File upload functionality
- ✅ Real-time features ready
- ✅ Error handling & validation
- ✅ Code organization & best practices

### Test accounts
- **Admin full access**: admin@taskmanager.com / password123
- **Manager access**: pm@taskmanager.com / password123  
- **Basic user**: dev@taskmanager.com / password123

### Demo data
- 500+ sample tasks với varied statuses
- 10+ teams với realistic hierarchies  
- 20+ projects với milestones
- Comments và activity logs
- File attachments examples

### Grading checklist
- [x] Working authentication system
- [x] CRUD operations for all entities
- [x] Responsive UI/UX
- [x] Database relationships
- [x] API documentation
- [x] Error handling
- [x] Code quality & structure
- [x] Deployment ready

**Contact**: Để demo trực tiếp hoặc câu hỏi kỹ thuật, vui lòng liên hệ qua GitHub Issues.
