# Hướng dẫn thêm người dùng vào MongoDB Atlas

## Bước 1: Đăng nhập vào Atlas
- Truy cập https://cloud.mongodb.com/ và đăng nhập với tài khoản của bạn

## Bước 2: Mời người dùng vào Organization hoặc Project
### Thêm vào Organization (nếu muốn chia sẻ nhiều project)
1. Chọn dropdown menu ở góc trên bên trái (hiển thị tên Organization hiện tại)
2. Chọn "View All Organizations"
3. Chọn organization của bạn
4. Chọn tab "Access Manager" > "Organization Access"
5. Nhấn nút "Add Users"
6. Nhập email người dùng và chọn quyền hạn phù hợp (thường là Organization Member)
7. Người dùng sẽ nhận được email mời và cần chấp nhận lời mời

### Thêm vào Project (nếu chỉ muốn chia sẻ 1 project cụ thể)
1. Vào project của bạn (CSDLTT)
2. Chọn "Project Access" trong menu bên trái
3. Nhấn nút "Add Users"
4. Nhập email của người dùng và chọn quyền phù hợp (thường là Project Member)
5. Người dùng sẽ nhận được email mời và cần chấp nhận lời mời

## Bước 3: Tạo Database User cho người dùng
1. Vào project của bạn (CSDLTT) 
2. Chọn "Database Access" trong menu bên trái
3. Nhấn nút "Add New Database User"
4. Chọn Authentication Method là "Password"
5. Nhập username và password cho người dùng này
   - Username: [tên người dùng mới, ví dụ: another_user]
   - Password: [mật khẩu an toàn]
6. Ở phần Database User Privileges, chọn quyền phù hợp:
   - Để họ chỉ đọc: chọn "Read Only"
   - Để họ có thể đọc và ghi: chọn "Read and Write to Any Database"
7. Nhấn "Add User"

## Bước 4: Thêm IP vào whitelist
1. Vào project của bạn (CSDLTT)
2. Chọn "Network Access" trong menu bên trái
3. Nhấn nút "Add IP Address"
4. Nhập IP của người dùng hoặc chọn "Allow Access from Anywhere" nếu họ làm việc ở nhiều nơi
5. Nhấn "Confirm"

## Bước 5: Chia sẻ connection string
Chia sẻ connection string với họ, nhưng thay thế username và password bằng thông tin của họ:

