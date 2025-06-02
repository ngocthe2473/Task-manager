TRƯỜNG ĐẠI HỌC VINH
VIỆN KỸ THUẬT VÀ CÔNG NGHỆ


 

TIỂU LUẬN HỌC PHẦN 
CÁC HỆ CƠ SỞ DỮ LIỆU TIÊN TIẾN

PHÁT TRIỂN WEBSITE QUẢN LÝ CÔNG VIỆC 
VỚI NODE.JS VÀ MONGODB






NHÓM: 04


GVHD:	TS. Phan Anh Phong
SVTH:	Nguyễn Tấn Long, 215748020110320
	Trần Đại Việt, 215748020110204
Trần Ngọc Thế, 215748020110414

			   




Nghệ An, 06/2025
 
MỞ ĐẦU
Trong bối cảnh thị trường dịch vụ ăn uống ngày càng phát triển, việc quản lý hoạt động kinh doanh quán cà phê trở nên vô cùng quan trọng để nâng cao chất lượng phục vụ, tối ưu hóa nguồn lực và tăng tính cạnh tranh. Đặc biệt, với số lượng khách hàng ngày càng đông, nhu cầu đa dạng hóa dịch vụ và quản lý hiệu quả các nguồn lực như thực đơn, đơn hàng, nhân viên, bàn và kho nguyên liệu là những thách thức lớn đối với các chủ quán cà phê. Các phương pháp quản lý truyền thống dựa trên giấy tờ hoặc ghi chép thủ công không chỉ tốn nhiều thời gian mà còn dễ dẫn đến sai sót, thiếu chính xác và khó kiểm soát trong quá trình vận hành.
Đề tài “Xây dựng Website bán và quản lý quán cà phê tích hợp hệ thống gợi ý và chatbot” hướng đến việc phát triển một hệ thống tự động, giúp chủ quán và nhân viên dễ dàng quản lý, vận hành các hoạt động kinh doanh trong quán một cách hiệu quả. Hệ thống sẽ tích hợp các chức năng như quản lý thực đơn, bàn, đơn hàng, khách hàng, nhân viên, kho nguyên liệu, đồng thời hỗ trợ đặt món, thanh toán, báo cáo doanh thu, cũng như các tính năng nâng cao như gợi ý món, chatbot hỗ trợ khách hàng. Việc ứng dụng công nghệ sẽ giúp giảm thiểu sai sót, tăng tính minh bạch và chuyên nghiệp hóa quá trình phục vụ khách hàng.
Đồ án sử dụng ngôn ngữ lập trình Python với framework Django và hệ quản trị cơ sở dữ liệu MySQL để xây dựng hệ thống. Với các tính năng quản lý phong phú, khoa học, hệ thống sẽ góp phần tối ưu hóa hoạt động kinh doanh của quán cà phê. Tuy nhiên, do phạm vi đề tài khá rộng và thời gian thực hiện có hạn, nhóm rất mong nhận được sự góp ý, phản hồi từ các thầy cô để hoàn thiện và nâng cao chất lượng sản phẩm.
 
LỜI CẢM ƠN
Trước tiên, chúng em xin bày tỏ lòng biết ơn sâu sắc đến Thầy giáo ThS. Lê Văn Thành, người đã luôn tận tâm hướng dẫn, hỗ trợ và truyền đạt kiến thức cho chúng em trong suốt quá trình thực hiện đề tài này. Thầy không chỉ là người thầy tận tụy mà còn là người bạn, người đồng hành quý báu trong hành trình học tập và nghiên cứu của chúng em.
Chúng em đặc biệt biết ơn Thầy vì đã dành thời gian quý báu để hướng dẫn chúng em từng bước trong công việc nghiên cứu, phát triển và hoàn thiện phần mềm này. Mỗi buổi gặp gỡ với Thầy đều là một cơ hội quý giá để chúng em học hỏi thêm những kiến thức mới, được giải đáp những thắc mắc và nhận được những lời khuyên bổ ích. Sự chỉ bảo tận tình, những góp ý quý giá và kiến thức chuyên sâu của Thầy đã giúp chúng em không chỉ nâng cao chuyên môn mà còn rèn luyện được kỹ năng giải quyết vấn đề, tư duy logic và khả năng làm việc nhóm.
Thầy đã luôn động viên chúng em vượt qua những khó khăn, thử thách trong suốt quá trình thực hiện đề tài. Những lời khuyên chân thành và sự khích lệ của Thầy chính là động lực to lớn giúp chúng em vững bước trên con đường nghiên cứu, phát triển và hoàn thiện sản phẩm. Thầy không chỉ là người truyền đạt kiến thức mà còn là người định hướng, truyền cảm hứng cho chúng em trong mỗi công việc.
Một lần nữa, chúng em xin chân thành cảm ơn Thầy về tất cả những gì Thầy đã làm cho chúng em. Chúng em kính chúc Thầy sức khỏe, hạnh phúc và thành công rực rỡ trong sự nghiệp giảng dạy cũng như trong cuộc sống. Chúng em sẽ luôn ghi nhớ và áp dụng những bài học quý báu mà Thầy đã dạy, để không ngừng phấn đấu và hoàn thiện bản thân trong tương lai.
 
MỤC LỤC

MỞ ĐẦU	1
LỜI CẢM ƠN	2
DANH MỤC CÁC HÌNH	5
DANH MỤC CÁC BẢNG	6
I. GIỚI THIỆU ĐỀ TÀI	7
1.1. Lý do chọn đề tài	7
1.2. Ý nghĩa thực tiễn của việc xây dựng website sử dụng MongoDB	7
1.3. Mục tiêu tiểu luận	7
1.4. Phạm vi đề tài	7
1.5. Phương pháp thực hiện	7
II. CƠ SỞ LÝ THUYẾT	8
2.1. Tổng quan về website	8
2.2. Giới thiệu MongoDB	8
2.3. Các công nghệ hỗ trợ khác	8
III. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG	9
3.1. Phân tích yêu cầu hệ thống	9
3.2. Thiết kế cơ sở dữ liệu MongoDB	9
3.3. Thiết kế hệ thống	9
IV. XÂY DỰNG HỆ THỐNG	10
4.1. Chuẩn bị môi trường phát triển	10
4.2. Cài đặt thư viện cần thiết	10
4.3. Xây dựng backend	10
4.4. Xây dựng frontend	10
4.5. Kiểm thử chức năng chính	10
V. KẾT QUẢ ĐẠT ĐƯỢC	11
VI. ĐÁNH GIÁ, KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN	12
6.1. Những thuận lợi và khó khăn	12
6.2. Bài học kinh nghiệm	12
6.3. Hướng phát triển trong tương lai	12
VII. TÀI LIỆU THAM KHẢO	13
PHỤ LỤC	14

 
DANH MỤC CÁC HÌNH
Hình 2.1. Biểu đồ lớp của hệ thống	13
Hình 2.2. Biểu đồ ca sử dụng quản lý người dùng, đăng nhập tài khoản	15
Hình 2.3. Sơ đồ tuần tự của chức năng đăng ký	20
Hình 2.4. Sơ đồ tuần tự của chức năng đăng nhập	21
Hình 2.5. Sơ đồ tuần tự của chức năng quên mật khẩu	21
Hình 2.6. Sơ đồ tuần tự của chức năng phân quyền	22
Hình 2.7. Sơ đồ tuần tự của chức năng khóa/xóa tài khoản	22
Hình 2.8. Phác họa giao diện trang chủ	23
Hình 2.9. Phác họa giao diện trang đặt bàn	23
Hình 2.10. Phác họa giao diện trang đơn hàng của khách hàng	23
Hình 2.11. Sơ đồ ca sử dụng của chức năng quản lý thực đơn	25
Hình 2.12. Sơ đồ tuần tự của chức năng thêm món mới	31
Hình 2.13. Sơ đồ tuần tự của chức năng sửa/xóa món ăn	32
Hình 2.14. Sơ đồ tuần tự chức năng thêm/cập nhật/xóa bàn	32
Hình 2.15. Sơ đồ tuần tự chức năng đặt bàn	33
Hình 2.16. Giao diện thực đơn món ăn	33
Hình 2.17. Giao diện chi tiết sản phẩm	33
Hình 2.18. Giao diện đặt bàn	34
Hình 2.19. Giao diện trang đơn hàng	46
Hình 2.20. Giao diện chatbot	47
Hình 2.21. Giao diện gợi ý món ăn	47
Hình 3.1. Giao diện quản lý dự án trên ClickUp	50


 
DANH MỤC CÁC BẢNG
Bảng 1.1. Bảng yêu cầu chức năng của hệ thống	9
Bảng 1.2. Bảng phân chia công việc thành viên nhóm	10
Bảng 2.1. Bảng phân tích yêu cầu hệ thống	11
Bảng 2.2. Chi tiết bảng người dùng (User)	15
Bảng 2.3. Chi tiết bảng nhóm người dùng (Group)	15
Bảng 2.4. Chi tiết bảng phân nhóm người dùng (Group Users)	15
Bảng 2.5. Chi tiết bảng phân quyền (Permission)	15
Bảng 2.6. Chi tiết bảng phân quyền nhóm (Group permission)	15
Bảng 2.7. Bảng chi tiết quy trình quản lý người dùng	17
Bảng 2.8. Bảng chi tiết quy trình đăng nhập hệ thống	18
Bảng 2.9. Chi tiết bảng loại danh mục món (Category)	23
Bảng 2.10. Chi tiết bảng các món ăn trong thực đơn (Product)	23
Bảng 2.11. Chi tiết bảng thông tin các bàn trong quán (Table)	23
Bảng 2.12. Chi tiết bảng thông tin đặt bàn (Reservation)	24
Bảng 2.13. Bảng quy trình quản lý thực đơn	26
Bảng 2.14. Bảng quy trình quản lý bàn	27
Bảng 2.15. Chi tiết bảng kho nguyên vật liệu (Inventory)	29
Bảng 2.16. Chi tiết bảng khách hàng (Customer)	29
Bảng 2.17. Chi tiết bảng báo cáo doanh thu (Report)	30
Bảng 2.18. Bảng quy trình quản lý kho	30
Bảng 2.19. Bảng quy trình quản lý khách hàng	31
Bảng 2.20. Chi tiết bảng lịch sử đặt món (Order History)	34
Bảng 2.21. Chi tiết bảng món gợi ý	35
Bảng 2.22. Chi tiết bảng đơn hàng (Order)	37
Bảng 2.23. Chi tiết bảng chi tiết đơn hàng (OrderDetail)	37
Bảng 2.24. Chi tiết bảng hóa đơn (Invoice)	37
Bảng 4.1. Chi tiết bảng hội thoại chatbot (ChatSession)	44
Bảng 4.1. Chi tiết bảng tin nhắn chatbot (ChatMessage)	44

 
I. GIỚI THIỆU ĐỀ TÀI
1.1. Lý do chọn đề tài
Text Bao Cao
1.2. Ý nghĩa thực tiễn của việc xây dựng website sử dụng MongoDB
Text Bao Cao
1.3. Mục tiêu tiểu luận
Text Bao Cao
1.4. Phạm vi đề tài
Text Bao Cao
1.5. Phương pháp thực hiện
Text Bao Cao
 
II. CƠ SỞ LÝ THUYẾT
2.1. Tổng quan về website
Text Bao Cao
2.2. Giới thiệu MongoDB
Text Bao Cao
2.3. Các công nghệ hỗ trợ khác
Text Bao Cao
 
III. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
3.1. Phân tích yêu cầu hệ thống
3.2. Thiết kế cơ sở dữ liệu MongoDB
3.3. Thiết kế hệ thống
 
IV. XÂY DỰNG HỆ THỐNG
4.1. Chuẩn bị môi trường phát triển
4.2. Cài đặt thư viện cần thiết
4.3. Xây dựng backend
4.4. Xây dựng frontend
4.5. Kiểm thử chức năng chính

 
V. KẾT QUẢ ĐẠT ĐƯỢC
 
VI. ĐÁNH GIÁ, KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
6.1. Những thuận lợi và khó khăn
6.2. Bài học kinh nghiệm
6.3. Hướng phát triển trong tương lai
 
VII. TÀI LIỆU THAM KHẢO
[1] Tài liệu chính thức Django: https://docs.djangoproject.com/
[2] MySQL Documentation: https://dev.mysql.com/doc/
[3] Django REST Framework: https://www.django-rest-framework.org/
[4] Bootstrap Documentation: https://getbootstrap.com/docs/
[5] ClickUp Documentation: https://help.clickup.com/
[6] Rasa Open Source Documentation (Chatbot): https://rasa.com/docs/rasa/
[7] Dialogflow Documentation: https://cloud.google.com/dialogflow/docs
[8] Tài liệu, bài viết tham khảo về quản lý quán cà phê, hệ thống phần mềm F&B:
 - https://cukcuk.vn/
 - https://www.sapo.vn/
 - https://www.posapp.vn/
 - https://www.kiotviet.vn/
[9] Một số nguồn khác về kiểm thử phần mềm, kiến trúc máy tính:
 - https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/
 - https://www.techtarget.com/searchsoftwarequality/definition/performance-testing


	
 
PHỤ LỤC
