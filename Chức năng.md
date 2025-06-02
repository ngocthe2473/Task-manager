1. Bảng phân công chức năng hệ thống quản lý công việc
STT	Nhóm chức năng	Chức năng cụ thể	Người thực hiện
I	Xác thực người dùng	- Đăng ký, đăng nhập, đăng xuất
- Phân quyền (admin/người dùng thường)	Trần Ngọc Thế
II	Quản lý công việc	- Tạo/sửa/xoá công việc (task)
- Gán người thực hiện
- Giao việc
- Đặt deadline
- Đổi trạng thái (Chưa làm, Đang làm, Hoàn thành)	Nguyễn Tấn Long
	Công việc con (sub-task)	- Thêm/sửa/xoá sub-task
- Gán người thực hiện
- Cập nhật trạng thái riêng cho từng sub-task	Nguyễn Tấn Long
	Xem lịch	- Hiển thị task/sub-task theo deadline trên lịch
- Lọc theo người thực hiện, trạng thái
- Click vào task để xem chi tiết	Nguyễn Tấn Long
III	Tương tác & cộng tác	- Bình luận: Thêm/sửa/xoá bình luận trên task hoặc sub-task
- Phản hồi bình luận: Trả lời bình luận mẹ, hiển thị theo dạng thread
- Gửi file đính kèm: Tải lên/tải xuống/xoá file
- Gửi ảnh: Xem trước ảnh trực tiếp	Trần Đại Việt
IV	Hỗ trợ nâng cao	- Tìm kiếm: Theo từ khoá, người giao, trạng thái
- Lọc & sắp xếp: Theo thời gian, mức độ ưu tiên
- Thông báo: Khi có task mới, comment mới, gần đến deadline
- Thống kê: Task hoàn thành, đang làm, trễ hạn theo ngày/tuần/tháng	Trần Đại Việt
V	Quản lý người dùng (tuỳ chọn)	- Xem danh sách người dùng
- Xem task của từng người
- Khoá tài khoản / phân quyền (nếu là admin)	Trần Ngọc Thế
VI	Quản lý team	- Tạo team (nhóm làm việc)
- Thêm / xoá thành viên khỏi team
- Phân quyền trong team (leader, member)
- Xem danh sách các team	Trần Đại Việt
VII	Quản lý project	- Tạo / sửa / xoá project
- Gán project cho team hoặc người dùng
- Mỗi project chứa danh sách task riêng
- Thống kê tiến độ theo từng project	Nguyễn Tấn Long





2. Cấu trúc các Collection trong MongoDB
1. ActivityLog
•	user: ObjectId - Tham chiếu đến User, bắt buộc.
•	action: String - Các giá trị hợp lệ: ['create', 'update', 'delete', 'login', 'logout'], bắt buộc.
•	entityType: String - Các giá trị hợp lệ: ['User', 'Team', 'Project', 'Task', 'Comment', 'TimeLog'], bắt buộc.
•	entityId: ObjectId - ID của thực thể liên quan.
•	metadata: Object - Thông tin bổ sung.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
2. Comment
•	content: String - Nội dung bình luận, bắt buộc.
•	task: ObjectId - Tham chiếu đến Task, bắt buộc.
•	user: ObjectId - Tham chiếu đến User, bắt buộc.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
3. Notification
•	user: ObjectId - Tham chiếu đến User, bắt buộc.
•	content: String - Nội dung thông báo, bắt buộc.
•	type: String - Các giá trị hợp lệ: ['task_assigned', 'comment', 'due_date_reminder', 'project_update'], bắt buộc.
•	isRead: Boolean - Trạng thái đã đọc, mặc định là false.
•	relatedEntity: ObjectId - Tham chiếu đến thực thể liên quan thông qua onModel.
•	onModel: String - Các giá trị hợp lệ: ['Task', 'Project', 'Comment'].
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
4. Project
•	name: String - Tên dự án, bắt buộc.
•	description: String - Mô tả dự án.
•	team: ObjectId - Tham chiếu đến Team, bắt buộc.
•	status: String - Trạng thái dự án, các giá trị hợp lệ: ['planning', 'in_progress', 'completed'], mặc định là planning.
•	startDate: Date - Ngày bắt đầu.
•	endDate: Date - Ngày kết thúc.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
5. Task
•	title: String - Tiêu đề công việc, bắt buộc.
•	description: String - Mô tả công việc.
•	project: ObjectId - Tham chiếu đến Project, bắt buộc.
•	assignee: ObjectId - Tham chiếu đến User.
•	status: String - Trạng thái công việc, các giá trị hợp lệ: ['todo', 'in_progress', 'done'], mặc định là todo.
•	priority: String - Độ ưu tiên, các giá trị hợp lệ: ['low', 'medium', 'high'], mặc định là medium.
•	dueDate: Date - Thời hạn hoàn thành.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
•	updatedAt: Date - Thời gian cập nhật, mặc định là thời gian hiện tại.
6. Team
•	name: String - Tên nhóm, bắt buộc.
•	description: String - Mô tả nhóm.
•	manager: ObjectId - Tham chiếu đến User, bắt buộc.
•	members: Array - Danh sách thành viên, tham chiếu đến User.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
7. TimeLog
•	task: ObjectId - Tham chiếu đến Task, bắt buộc.
•	user: ObjectId - Tham chiếu đến User, bắt buộc.
•	duration: Number - Thời lượng (phút), bắt buộc.
•	date: Date - Ngày ghi nhận, mặc định là thời gian hiện tại.
•	description: String - Mô tả thời gian làm việc.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
8. User
•	username: String - Tên đăng nhập, bắt buộc, duy nhất.
•	email: String - Email, bắt buộc, duy nhất.
•	name: String - Tên đầy đủ, bắt buộc.
•	password: String - Mật khẩu, bắt buộc, tối thiểu 6 ký tự.
•	role: String - Vai trò, các giá trị hợp lệ: ['admin', 'manager', 'member'], mặc định là member.
•	team: ObjectId - Tham chiếu đến Team.
•	isActive: Boolean – Trạng thái tài khoản.
•	createdAt: Date - Thời gian tạo, mặc định là thời gian hiện tại.
3. Cấu trúc thư mục trong project
3.1. Thư mục models
Chứa các models đại diện cho các collection trong MongoDB:
•	ActivityLog.js: Ghi nhận các hành động trong hệ thống.
•	Comment.js: Quản lý các bình luận liên kết với công việc.
•	Notification.js: Thông báo cho người dùng về các sự kiện.
•	Project.js: Đại diện cho các dự án.
•	Task.js: Đại diện cho các công việc trong dự án.
•	Team.js: Đại diện cho các nhóm làm việc.
•	TimeLog.js: Ghi nhận thời gian làm việc của các thành viên.
•	User.js: Đại diện cho người dùng.
3.2. Thư mục routes (API Routes)
Định nghĩa các endpoint API mà ứng dụng sử dụng:
•	userRoutes.js: Quản lý người dùng (GET, POST, PUT, DELETE).
•	projectRoutes.js: Quản lý dự án (GET, POST, PUT).
•	timeLogRoutes.js: Quản lý ghi nhận thời gian làm việc (GET, POST).
•	commentRoutes.js: Quản lý bình luận (GET, POST).
3.3. Thư mục controllers
Xử lý logic ứng dụng cho các yêu cầu API:
•	timeLogController.js: Xử lý các yêu cầu liên quan đến TimeLog.
•	taskController.js: Xử lý các yêu cầu liên quan đến công việc.
•	projectController.js: Xử lý các yêu cầu liên quan đến dự án.
•	userController.js: Xử lý các yêu cầu liên quan đến người dùng.
3.4. Thư mục config
Chứa các file cấu hình:
•	db.js: Kết nối đến MongoDB.
•	auth.js: Tạo và xác thực token JWT.
3.5. Mối quan hệ giữa các thành phần
1.	Client ↔ API Routes:
o	Client gửi HTTP Requests đến API Routes và nhận phản hồi (Responses).
2.	API Routes ↔ Controllers:
o	API Routes chuyển yêu cầu tới Controllers để xử lý logic nghiệp vụ.
3.	Controllers ↔ Models:
o	Controllers sử dụng Models để tương tác với cơ sở dữ liệu MongoDB.
4. Chi tiết thực hiện
I. Xác thực người dùng
•	Đăng ký, đăng nhập, đăng xuất:
o	Dùng thư viện jsonwebtoken để tạo và xác thực token đăng nhập.
o	Dùng bcryptjs để mã hoá mật khẩu nhằm bảo vệ thông tin người dùng.
•	Phân quyền (admin/người dùng thường):
o	Dùng middleware kiểm tra vai trò người dùng (admin hoặc user) để giới hạn quyền truy cập.
II. Quản lý công việc
•	Tạo/sửa/xoá công việc (task):
o	Dùng HTTP methods (POST/PUT/DELETE) để thực hiện các thao tác CRUD cho task.
o	Dùng mongoose để lưu thông tin task vào MongoDB.
•	Gán người thực hiện:
o	Dùng mongoose để lưu thông tin người dùng được gán vào trường assignee trong model Task.
•	Giao việc:
o	Kết hợp thông báo (Notification) với việc giao task để gửi thông báo tới người thực hiện.
•	Đặt deadline:
o	Dùng mongoose để lưu trường deadline trong model Task.
•	Đổi trạng thái (Chưa làm, Đang làm, Hoàn thành):
o	Dùng API PUT để cập nhật trường status của task trong cơ sở dữ liệu.
Công việc con (sub-task)
•	Thêm/sửa/xoá sub-task:
o	Dùng mongoose để liên kết sub-task với task chính qua parentTaskId.
•	Gán người thực hiện:
o	Dùng mongoose để lưu thông tin người thực hiện sub-task vào trường assignee.
•	Cập nhật trạng thái riêng cho từng sub-task:
o	Dùng API PUT để cập nhật trạng thái của từng sub-task và đồng bộ với task chính nếu cần.
Xem lịch
•	Hiển thị task/sub-task theo deadline trên lịch:
o	Sử dụng thư viện lịch (như react-calendar hoặc hệ thống tương tự) để hiển thị task/sub-task dựa trên deadline.
•	Lọc theo người thực hiện, trạng thái:
o	Dùng các bộ lọc trên giao diện để lọc dữ liệu từ cơ sở dữ liệu MongoDB.
•	Click vào task để xem chi tiết:
o	Tạo endpoint để trả về chi tiết task/sub-task khi người dùng nhấn vào.
III. Tương tác & cộng tác
•	Bình luận:
o	Dùng mongoose để lưu các bình luận vào model Comment với liên kết đến task hoặc sub-task.
•	Phản hồi bình luận:
o	Tạo hệ thống thread bằng cách liên kết bình luận con với bình luận mẹ qua trường parentCommentId.
•	Gửi file đính kèm:
o	Dùng thư viện multer để tải lên file và lưu đường dẫn file trên server hoặc lưu trữ đám mây.
•	Gửi ảnh:
o	Kết hợp multer với các thư viện hiển thị ảnh như react-image-preview để xem trước ảnh.
IV. Hỗ trợ nâng cao
•	Tìm kiếm:
o	Sử dụng mongoose để tìm kiếm task theo từ khoá, người giao hoặc trạng thái.
•	Lọc & sắp xếp:
o	Dùng các truy vấn MongoDB (sort, filter) để sắp xếp và lọc task theo thời gian hoặc mức độ ưu tiên.
•	Thông báo:
o	Dùng mongoose để lưu thông báo vào model Notification và gửi thông báo thời gian thực qua WebSocket hoặc API REST.
•	Thống kê:
o	Dùng các truy vấn MongoDB (aggregate) để tính toán số lượng task hoàn thành, đang làm, hoặc trễ hạn.
V. Quản lý người dùng (tuỳ chọn)
•	Xem danh sách người dùng:
o	Dùng mongoose để truy vấn danh sách người dùng từ model User.
•	Xem task của từng người:
o	Lọc task/sub-task theo người thực hiện bằng truy vấn MongoDB.
•	Khoá tài khoản / phân quyền:
o	Dùng middleware để kiểm tra quyền admin khi thực hiện thao tác này.
VI. Quản lý team
•	Tạo team (nhóm làm việc):
o	Dùng mongoose để tạo và lưu thông tin team vào model Team.
•	Thêm/xoá thành viên khỏi team:
o	Dùng các truy vấn MongoDB để thêm hoặc xoá thành viên từ danh sách members của team.
•	Phân quyền trong team (leader, member):
o	Thêm trường role vào danh sách thành viên của team để quản lý vai trò.
•	Xem danh sách các team:
o	Dùng API GET để trả về danh sách các team từ cơ sở dữ liệu.
VII. Quản lý project
•	Tạo/sửa/xoá project:
o	Dùng mongoose để thực hiện các thao tác CRUD trên model Project.
•	Gán project cho team hoặc người dùng:
o	Liên kết project với team hoặc người dùng qua trường teamId hoặc userId.
•	Mỗi project chứa danh sách task riêng:
o	Dùng mongoose để liên kết task với project qua trường projectId.
•	Thống kê tiến độ theo từng project:
o	Sử dụng MongoDB aggregate để tính toán phần trăm hoàn thành dự án (dựa trên task/sub-task).
