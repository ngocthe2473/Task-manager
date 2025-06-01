# Hướng dẫn Setup cho thành viên nhóm

## 1. Clone repository
```bash
git clone <repository-url>
cd Task-manager
```

## 2. Cài đặt dependencies
```bash
npm install
cd client
npm install
cd ..
```

## 3. Cấu hình môi trường
- Copy file `.env.example` thành `.env`
- Liên hệ leader để lấy thông tin MongoDB Atlas connection string

## 4. Seed dữ liệu mẫu (chỉ chạy 1 lần)
```bash
npm run seed
```

## 5. Chạy ứng dụng
```bash
npm run dev
```

## 6. Đăng nhập
- URL: http://localhost:3000
- Tài khoản test:
  - admin/123456 (Admin)
  - the/123456 (Manager) 
  - long/123456 (Member)
  - viet/123456 (Member)

## Lưu ý
- Không commit file `.env` lên git
- Luôn pull code mới nhất trước khi làm việc
- Tạo branch riêng cho từng feature
