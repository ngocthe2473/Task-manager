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
Trong thời đại số hóa hiện nay, khi mà công nghệ thông tin đã và đang len lỏi vào từng ngóc ngách của đời sống, việc quản lý công việc một cách hiệu quả ngày càng trở nên quan trọng và cấp thiết. Không chỉ các doanh nghiệp lớn, các tổ chức mà ngay cả những nhóm nhỏ, cá nhân cũng cần những công cụ quản lý công việc khoa học, hiện đại để nâng cao năng suất, tối ưu hóa quy trình làm việc và giảm thiểu những sai sót không đáng có. Đứng trước nhu cầu đó, các hệ thống quản lý công việc trực tuyến đã ra đời và phát triển mạnh mẽ, trở thành một phần không thể thiếu trong môi trường làm việc hiện đại.
Tuy nhiên, không phải hệ thống nào cũng đáp ứng được đầy đủ các yêu cầu thực tiễn của người dùng. Đa phần các giải pháp hiện hành gặp phải hạn chế về tính mở rộng, khó tùy biến hoặc không thích ứng tốt với các quy mô tổ chức khác nhau. Từ thực tế này, nhóm chúng em quyết định lựa chọn đề tài “Phát triển Website quản lý công việc với Node.js và MongoDB” với mong muốn xây dựng một giải pháp quản lý công việc hiện đại, linh hoạt, dễ mở rộng và dễ tích hợp với các công nghệ mới. Đề tài không chỉ tập trung vào việc giải quyết bài toán quản lý công việc thông thường mà còn hướng tới khả năng cộng tác đa chiều, hỗ trợ các chức năng nâng cao như thống kê, thông báo, phân quyền, quản lý dự án, đội nhóm, đồng thời đảm bảo tính bảo mật và hiệu năng của hệ thống.
Thông qua tiểu luận này, nhóm không chỉ mong muốn áp dụng các kiến thức đã được học về hệ cơ sở dữ liệu tiên tiến, lập trình web mà còn rèn luyện kỹ năng làm việc nhóm, khả năng nghiên cứu, giải quyết vấn đề thực tiễn.  
LỜI CẢM ƠN
Trước tiên, nhóm chúng em xin bày tỏ lòng biết ơn sâu sắc đến quý thầy cô Trường Đại học Vinh, đặc biệt là thầy TS. Phan Anh Phong – người đã tận tình hướng dẫn, chỉ bảo và truyền đạt cho chúng em những kiến thức quý báu về lĩnh vực hệ cơ sở dữ liệu tiên tiến, cũng như luôn động viên, tạo điều kiện thuận lợi để nhóm hoàn thành đề tài này. Những lời khuyên chân thành, những góp ý tỉ mỉ của thầy trong suốt quá trình thực hiện tiểu luận đã giúp chúng em bổ sung, hoàn thiện các kiến thức chuyên môn lẫn kỹ năng mềm, đồng thời nâng cao tinh thần trách nhiệm trong công việc.
Chúng em cũng xin gửi lời cảm ơn đến các thành viên trong nhóm vì sự đoàn kết, phối hợp chặt chẽ và tinh thần làm việc nghiêm túc, sáng tạo trong suốt quá trình từ nghiên cứu, xây dựng cho tới hoàn thiện hệ thống. Mỗi thành viên đều đã nỗ lực hết mình với tinh thần trách nhiệm cao nhất, cùng nhau vượt qua những khó khăn, thử thách để đạt được mục tiêu chung. Bên cạnh đó, chúng em cũng cảm ơn bạn bè, người thân đã động viên, hỗ trợ về tinh thần và góp ý để nhóm hoàn thành tốt tiểu luận này.
Chúng em nhận thức rằng, trong quá trình thực hiện không thể tránh khỏi những thiếu sót nhất định. Nhóm rất mong nhận được sự thông cảm, góp ý của quý thầy cô và các bạn để sản phẩm ngày càng hoàn thiện hơn. Một lần nữa, chúng em xin gửi lời cảm ơn chân thành nhất đến quý thầy cô, các bạn và tất cả những ai đã giúp đỡ, tạo điều kiện để tiểu luận này được hoàn thành đúng tiến độ và đạt chất lượng tốt.
 
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

 
1. GIỚI THIỆU ĐỀ TÀI
Trước sự phát triển không ngừng của khoa học công nghệ, đặc biệt là lĩnh vực phần mềm, việc ứng dụng các hệ thống quản lý công việc trực tuyến đã và đang trở thành một xu thế tất yếu trong mọi tổ chức, doanh nghiệp và thậm chí cả trong đời sống cá nhân. Quản lý công việc hiệu quả giúp con người tiết kiệm thời gian, nâng cao năng suất lao động, giảm thiểu rủi ro bỏ sót nhiệm vụ và thúc đẩy sự phối hợp nhóm.
1.1. Lý do chọn đề tài
Quản lý công việc là một trong những hoạt động cốt lõi quyết định hiệu quả và thành công của bất kỳ tổ chức, doanh nghiệp hay nhóm cá nhân nào trong thời đại hiện nay. Khi tốc độ phát triển của xã hội ngày càng nhanh, khối lượng công việc tăng lên, sự phối hợp giữa các thành viên ngày càng phức tạp, thì việc quản lý công việc một cách khoa học, minh bạch và hiệu quả là nhu cầu tất yếu. Thực tế cho thấy, nhiều tập thể, cá nhân gặp phải tình trạng bỏ sót nhiệm vụ, lãng phí thời gian do không có hệ thống quản lý công việc hợp lý, dẫn đến giảm hiệu suất và gặp khó khăn trong phối hợp, chia sẻ thông tin.
Bên cạnh đó, các giải pháp quản lý truyền thống như dùng giấy tờ hay các bảng tính Excel dần bộc lộ nhiều hạn chế: khó cập nhật, không hỗ trợ làm việc từ xa, thiếu khả năng đồng bộ và chia sẻ thông tin giữa các thành viên. Sự phát triển của các nền tảng số và nhu cầu làm việc linh hoạt, từ xa, đa thiết bị càng làm nổi bật vai trò của các hệ thống quản lý công việc trực tuyến.
Đặc biệt, với sự phát triển mạnh mẽ của các công nghệ như Node.js – nền tảng lập trình backend hiện đại, và MongoDB – hệ quản trị cơ sở dữ liệu NoSQL linh hoạt, việc xây dựng các ứng dụng quản lý công việc đã trở nên dễ dàng, hiệu quả và phù hợp hơn với nhu cầu thực tế. Đó cũng là lý do nhóm chúng em lựa chọn đề tài này, nhằm nghiên cứu và phát triển một website quản lý công việc mang tính ứng dụng cao, giải quyết những tồn tại của các phương pháp truyền thống, đồng thời tận dụng sức mạnh của những công nghệ mới nhất.
1.2. Ý nghĩa thực tiễn của việc xây dựng website sử dụng MongoDB
Việc xây dựng website quản lý công việc sử dụng MongoDB không chỉ đơn thuần là thực nghiệm lý thuyết, mà còn mang lại giá trị thực tiễn rõ rệt. Trước hết, MongoDB là hệ quản trị cơ sở dữ liệu NoSQL rất phổ biến, cho phép lưu trữ dữ liệu dưới dạng tài liệu (document) với cấu trúc linh hoạt, dễ dàng mở rộng hoặc thay đổi cấu trúc mà không ảnh hưởng đến toàn hệ thống. Điều này cực kỳ phù hợp với các ứng dụng quản lý công việc, nơi mà nghiệp vụ và yêu cầu thay đổi liên tục theo nhu cầu thực tế của tổ chức, nhóm hoặc cá nhân.
Ngoài ra, MongoDB còn hỗ trợ tốt cho các thao tác đồng thời, tốc độ truy xuất dữ liệu nhanh, dễ dàng mở rộng quy mô khi số lượng người dùng hoặc dữ liệu tăng lên. Việc sử dụng MongoDB giúp cho hệ thống quản lý công việc của nhóm có thể tích hợp thêm các tính năng nâng cao như thống kê, tìm kiếm nâng cao, phân quyền, thông báo thời gian thực mà không gặp rào cản về kỹ thuật. Đây cũng là lựa chọn phù hợp với xu hướng phát triển các ứng dụng web hiện đại, nơi tính linh hoạt, khả năng mở rộng và tích hợp là yếu tố tiên quyết.
1.3. Mục tiêu tiểu luận
Mục tiêu lớn nhất của tiểu luận là xây dựng thành công một hệ thống website quản lý công việc hiện đại, đáp ứng được các yêu cầu thực tế về quản lý công việc, phân quyền, cộng tác và mở rộng trong tương lai. Cụ thể, hệ thống cần đảm bảo các chức năng cơ bản như: đăng ký, đăng nhập, quản lý công việc, quản lý dự án, đội nhóm, hỗ trợ cộng tác và tương tác giữa các thành viên. Ngoài ra, mục tiêu của nhóm còn là rèn luyện kỹ năng phân tích, thiết kế hệ thống, áp dụng được các kiến thức về cơ sở dữ liệu tiên tiến, lập trình backend/frontend, kiểm thử phần mềm cũng như kỹ năng làm việc nhóm.
Về mặt sản phẩm, nhóm hướng đến một website dễ sử dụng, giao diện thân thiện, có thể nâng cấp thêm các tính năng nâng cao như thông báo, thống kê, tìm kiếm, phân quyền chi tiết,… Trong quá trình xây dựng, nhóm cũng chú trọng đến việc đảm bảo an toàn bảo mật cho hệ thống, tối ưu hiệu năng và khả năng bảo trì, mở rộng về sau.
1.4. Phạm vi đề tài
Để đảm bảo tính khả thi trong phạm vi thời gian và nguồn lực, đề tài chủ yếu tập trung xây dựng các chức năng cốt lõi của một hệ thống quản lý công việc hiện đại, bao gồm: quản lý người dùng, quản lý công việc (task), dự án (project), đội nhóm (team), phân quyền truy cập, thông báo, bình luận, thống kê cơ bản. Các chức năng nâng cao như tích hợp chat nội bộ, xuất báo cáo chuyên sâu, nhắc việc qua email, kết nối với các dịch vụ bên ngoài sẽ được nhóm xác định là hướng mở rộng trong tương lai.
Bên cạnh đó, tiểu luận tập trung vào backend sử dụng Node.js và MongoDB, frontend chủ yếu sử dụng HTML/CSS/JS cơ bản để minh họa, chưa phát triển giao diện phức tạp hoặc ứng dụng di động. Hệ thống hướng tới phục vụ nhóm nhỏ và có khả năng mở rộng lên quy mô lớn trong tương lai.
1.5. Phương pháp thực hiện
Để hoàn thành đề tài, nhóm áp dụng phương pháp luận chặt chẽ, kết hợp giữa lý thuyết và thực hành. Đầu tiên, nhóm nghiên cứu, tổng hợp các kiến thức về hệ cơ sở dữ liệu tiên tiến, Node.js, MongoDB, các mô hình kiến trúc phần mềm và kinh nghiệm thực tế từ các dự án mã nguồn mở, tài liệu kỹ thuật. Tiếp đến, nhóm tiến hành phân tích yêu cầu nghiệp vụ, xây dựng mô hình dữ liệu, thiết kế tổng thể hệ thống, phân chia công việc cho từng thành viên. Trong giai đoạn triển khai, nhóm áp dụng phương pháp phát triển phần mềm linh hoạt (agile), kiểm thử liên tục, rà soát và tối ưu mã nguồn, đồng thời ghi nhận các vấn đề phát sinh để điều chỉnh kịp thời. Cuối cùng, nhóm tổng kết kết quả, đánh giá, rút ra bài học kinh nghiệm và đề xuất hướng phát triển cho hệ thống. 
2. CƠ SỞ LÝ THUYẾT
Trong phần này, chúng ta sẽ tìm hiểu các kiến thức nền tảng cần thiết để xây dựng một hệ thống quản lý công việc hiện đại: từ tổng quan về website, cơ chế hoạt động client-server, đến các công nghệ chủ đạo như MongoDB và Node.js cùng các công nghệ hỗ trợ.
2.1. Tổng quan về website
Website là một trong những thành quả quan trọng của cách mạng công nghệ thông tin, đóng vai trò cầu nối giữa người dùng và hệ thống xử lý dữ liệu phía sau. Về bản chất, một website quản lý công việc hiện đại được xây dựng dựa trên mô hình client-server, trong đó client (trình duyệt web hoặc ứng dụng di động) sẽ gửi các yêu cầu thao tác đến server (máy chủ), nơi thực hiện xử lý các logic nghiệp vụ, tương tác với cơ sở dữ liệu và trả kết quả về cho client để hiển thị cho người dùng.
Frontend của website thường được xây dựng bằng các công nghệ HTML, CSS, JavaScript thuần hoặc các framework hiện đại như ReactJS, Angular, VueJS, giúp giao diện trở nên thân thiện, trực quan và phản hồi nhanh. Người dùng có thể dễ dàng đăng nhập, đăng ký, tạo mới, chỉnh sửa, xóa hoặc xem chi tiết các công việc, dự án, đội nhóm. Tất cả các thao tác này đều được trừu tượng hóa thành các API (Application Programming Interface) phía backend, đảm bảo dữ liệu luôn nhất quán, bảo mật và có thể mở rộng khi cần thiết.
Backend, thường được xây dựng bằng Node.js, chịu trách nhiệm xử lý các yêu cầu từ frontend, thực thi các logic nghiệp vụ phức tạp như xác thực, phân quyền, kiểm tra điều kiện, đồng thời tương tác với cơ sở dữ liệu (MongoDB) để lưu trữ và truy xuất thông tin. Mô hình này không chỉ giúp hệ thống tách biệt giữa giao diện và xử lý dữ liệu, mà còn thuận tiện cho việc mở rộng, bảo trì, phát triển thêm các nền tảng ứng dụng khác (mobile app, desktop app, v.v.).
2.2. Giới thiệu MongoDB
MongoDB là một trong những hệ quản trị cơ sở dữ liệu NoSQL phổ biến nhất trên thế giới, được sử dụng rộng rãi trong các dự án lớn nhỏ nhờ tính linh hoạt, dễ mở rộng và khả năng lưu trữ dữ liệu phi cấu trúc. Khác với các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) như MySQL, PostgreSQL vốn yêu cầu xác định cấu trúc bảng (schema) cứng nhắc ngay từ đầu, MongoDB cho phép lưu trữ dữ liệu dưới dạng tài liệu (document) với cấu trúc BSON (Binary JSON), mỗi document có thể chứa các trường khác nhau, phù hợp với các ứng dụng thường xuyên thay đổi về mặt nghiệp vụ.
Một cơ sở dữ liệu MongoDB bao gồm nhiều collection, mỗi collection tương đương với một bảng trong CSDL quan hệ nhưng không bắt buộc các document phải có cùng cấu trúc. Điều này giúp các nhà phát triển dễ dàng bổ sung các trường mới cho dữ liệu mà không ảnh hưởng đến các document hiện tại, giảm thiểu rủi ro gián đoạn hệ thống khi cập nhật nghiệp vụ.
Ngoài yếu tố linh hoạt, MongoDB còn có hiệu năng truy xuất dữ liệu cao, hỗ trợ tốt cho các ứng dụng thời gian thực nhờ khả năng index mạnh mẽ, hỗ trợ phân mảnh (sharding) để mở rộng theo chiều ngang, và cơ chế replica set để tăng độ tin cậy, đảm bảo an toàn dữ liệu. Đối với hệ thống quản lý công việc, nơi dữ liệu thường xuyên thay đổi, yêu cầu mở rộng nhanh, MongoDB là lựa chọn tối ưu giúp tiết kiệm chi phí, thời gian phát triển và dễ dàng tích hợp với các công nghệ web hiện đại.
2.3. Các công nghệ hỗ trợ khác
Để xây dựng một hệ thống quản lý công việc hoàn chỉnh, ngoài MongoDB và Node.js, còn rất nhiều công nghệ hỗ trợ cần thiết khác góp phần nâng cao hiệu quả phát triển, tính bảo mật và trải nghiệm người dùng.
Node.js: Là nền tảng để xây dựng backend sử dụng JavaScript, cho phép xử lý bất đồng bộ, tối ưu hiệu năng cho các ứng dụng nhiều người dùng cùng lúc. Node.js có hệ sinh thái thư viện phong phú, dễ tích hợp với các dịch vụ bên ngoài và hỗ trợ tốt các API RESTful.
Express.js: Là framework nhẹ cho Node.js, giúp tổ chức code backend một cách rõ ràng, phân chia các route (đường dẫn API), middleware (xử lý trung gian), hỗ trợ xác thực, phân quyền, xử lý lỗi nhanh chóng, thuận tiện cho việc mở rộng hệ thống.
Mongoose: Là thư viện ORM (Object-Document Mapping) phổ biến nhất cho MongoDB trên nền Node.js, cung cấp công cụ định nghĩa schema, validate dữ liệu, thao tác với database dễ dàng hơn, đồng thời giúp nhà phát triển kiểm soát tốt hơn luồng dữ liệu giữa backend và MongoDB.
Bcrypt.js, jsonwebtoken, cors: Các thư viện bảo mật quan trọng. Bcrypt.js dùng để mã hóa mật khẩu, đảm bảo không lưu plain-text trong database. Jsonwebtoken hỗ trợ tạo và kiểm tra token xác thực người dùng, giúp bảo vệ các API khỏi truy cập trái phép. Cors giúp cấu hình bảo mật cho phép hoặc từ chối các domain khác truy cập vào API backend.
Postman, VSCode, Git: Là các công cụ hỗ trợ phát triển và kiểm thử không thể thiếu. Postman dùng để kiểm thử API trong quá trình phát triển, VSCode là môi trường lập trình mạnh mẽ, còn Git giúp quản lý phiên bản mã nguồn, hỗ trợ làm việc nhóm hiệu quả.
Việc kết hợp và sử dụng thành thạo các công nghệ này không chỉ giúp rút ngắn thời gian phát triển mà còn đảm bảo hệ thống luôn vận hành ổn định, bảo mật và dễ dàng mở rộng, đáp ứng tốt các yêu cầu thực tế của người dùng trong bối cảnh công nghệ thay đổi không ngừng.
 
3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
Việc phân tích và thiết kế hệ thống là một trong những bước quan trọng và không thể thiếu trong quá trình xây dựng bất kỳ phần mềm nào, đặc biệt là với các hệ thống quản lý công việc có yêu cầu cao về tính linh hoạt, bảo mật, khả năng mở rộng và đáp ứng nhanh với nhu cầu thay đổi. Trong phần này, nhóm sẽ trình bày chi tiết quy trình phân tích yêu cầu, thiết kế cơ sở dữ liệu MongoDB cũng như kiến trúc tổng thể của hệ thống, nhằm đảm bảo mọi thành viên đều hiểu rõ nhiệm vụ, mối quan hệ giữa các thành phần cũng như hướng phát triển về lâu dài.
3.1. Phân tích yêu cầu hệ thống
Trước khi bắt tay xây dựng hệ thống, việc xác định rõ các yêu cầu chức năng và phi chức năng là điều kiện tiên quyết để đảm bảo đề tài giải quyết đúng và trúng nhu cầu thực tế. Hệ thống quản lý công việc mà nhóm hướng tới không chỉ dừng lại ở việc lưu trữ, chỉnh sửa, xóa công việc đơn lẻ mà còn phải hỗ trợ phân quyền, cộng tác nhóm, quản lý dự án, đội nhóm, thống kê, thông báo, tương tác giữa các thành viên và đảm bảo bảo mật cho toàn bộ dữ liệu.
Cụ thể, các yêu cầu chức năng chính của hệ thống bao gồm: quản lý người dùng (đăng ký, đăng nhập, phân quyền, khóa/mở tài khoản), quản lý công việc (tạo, sửa, xóa, giao việc, gán deadline, thay đổi trạng thái, gán người thực hiện), quản lý sub-task (công việc con), quản lý dự án, team, bình luận, gửi file đính kèm, tìm kiếm, lọc, sắp xếp, thống kê tiến độ, thông báo khi có sự kiện quan trọng (task mới, comment mới, gần đến deadline),... Ngoài ra, hệ thống còn cần hỗ trợ xem lịch, lọc theo trạng thái hoặc người thực hiện, quản lý quyền truy cập theo vai trò (admin, manager, thành viên), đảm bảo chỉ những người có quyền mới được thao tác với dữ liệu tương ứng.
Về yêu cầu phi chức năng, hệ thống cần đảm bảo hiệu năng cao, có thể phục vụ nhiều người dùng đồng thời, bảo mật thông tin nhạy cảm như mật khẩu, token đăng nhập, dữ liệu của từng user và nhóm. Giao diện cần trực quan, dễ sử dụng, hỗ trợ thao tác nhanh trên cả desktop và thiết bị di động. Ngoài ra, kiến trúc hệ thống phải dễ bảo trì, mở rộng, tích hợp thêm các tính năng hoặc dịch vụ mới trong tương lai mà không ảnh hưởng đến hoạt động hiện tại.
3.2. Thiết kế cơ sở dữ liệu MongoDB
Sau khi phân tích nghiệp vụ, nhóm tiến hành thiết kế cơ sở dữ liệu dựa trên mô hình NoSQL MongoDB, tận dụng tối đa ưu điểm về sự linh hoạt, mở rộng và hỗ trợ lưu trữ dữ liệu phi cấu trúc. Hệ thống xác định nhiều collection chính như: User, Team, Project, Task, SubTask, Comment, Notification, ActivityLog, TimeLog.
- User: Lưu thông tin người dùng như username, email, mật khẩu (được mã hóa), họ tên, vai trò (admin, manager, member), trạng thái tài khoản, thời gian tạo, đội nhóm đang tham gia.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính, tự động sinh
username	String	Có	Tên đăng nhập, duy nhất
email	String	Có	Email người dùng, duy nhất
name	String	Có	Tên đầy đủ người dùng
password	String	Có	Mật khẩu (được mã hóa)
role	String	Không	Vai trò: admin, manager, member (mặc định: member)
isActive	Boolean	Không	Trạng thái hoạt động tài khoản
createdAt	Date	Không	Thời điểm tạo tài khoản
Bảng 3.1. Cấu trúc collection User
- Team: Lưu thông tin nhóm làm việc, bao gồm tên nhóm, mô tả, người quản lý, danh sách thành viên, thời gian tạo.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
name	String	Có	Tên nhóm, duy nhất
description	String	Không	Mô tả nhóm
manager	ObjectId	Có	Tham chiếu tới User (quản lý nhóm)
members	Array	Không	Danh sách thành viên (ObjectId User)
createdAt	Date	Không	Thời điểm tạo
Bảng 3.2. Cấu trúc collection Team
- Project: Đại diện cho từng dự án, liên kết với một team cụ thể, chứa các trường tên dự án, mô tả, trạng thái, ngày bắt đầu, ngày kết thúc, thời gian tạo.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
name	String	Có	Tên dự án, duy nhất trong team
description	String	Không	Mô tả dự án
team	ObjectId	Có	Tham chiếu tới Team
status	String	Không	planning, in_progress, completed (mặc định: planning)
startDate	Date	Không	Ngày bắt đầu dự án
endDate	Date	Không	Ngày kết thúc dự án
createdAt	Date	Không	Thời điểm tạo
Bảng 3.3. Cấu trúc collection Project
- Task: Lưu thông tin công việc, liên kết với project, chứa tiêu đề, mô tả, người thực hiện, trạng thái, mức độ ưu tiên, deadline, thời gian tạo/cập nhật, danh sách sub-task.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
title	String	Có	Tiêu đề công việc
description	String	Không	Mô tả chi tiết công việc
project	ObjectId	Có	Tham chiếu tới Project
assignee	ObjectId	Không	Người được giao việc (User)
status	String	Không	todo, in_progress, done (mặc định: todo)
priority	String	Không	low, medium, high (mặc định: medium)
dueDate	Date	Không	Hạn hoàn thành
createdAt	Date	Không	Thời điểm tạo
updatedAt	Date	Không	Thời điểm cập nhật
Bảng 3.4. Cấu trúc collection Task
- SubTask: Lưu các công việc con thuộc một task lớn, gán người thực hiện riêng, cập nhật trạng thái và deadline riêng.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
task	ObjectId	Có	Tham chiếu tới Task cha
title	String	Có	Tiêu đề công việc con
assignee	ObjectId	Không	Người thực hiện
status	String	Không	todo, in_progress, done (mặc định: todo)
dueDate	Date	Không	Hạn hoàn thành
createdAt	Date	Không	Thời điểm tạo
Bảng 3.5. Cấu trúc collection Subtask
- Comment: Lưu bình luận của user trên từng task hoặc sub-task, hỗ trợ thread (phản hồi theo bình luận mẹ), thời gian tạo, người gửi.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
content	String	Có	Nội dung bình luận
task	ObjectId	Có	Tham chiếu Task/SubTask liên quan
user	ObjectId	Có	Người bình luận
parentCommentId	ObjectId	Không	Bình luận mẹ (nếu là phản hồi)
createdAt	Date	Không	Thời điểm tạo
_id	ObjectId	Có	Khóa chính
Bảng 3.6. Cấu trúc collection Comment
- Notification: Lưu thông báo cho người dùng về các sự kiện liên quan (task mới, comment, deadline, project update, ...), trạng thái đã đọc hay chưa.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
user	ObjectId	Có	Người nhận thông báo
content	String	Có	Nội dung thông báo
type	String	Có	task_assigned, comment, due_date_reminder, project_update
isRead	Boolean	Không	Đã đọc hay chưa (mặc định: false)
relatedEntity	ObjectId	Không	Tham chiếu thực thể liên quan
onModel	String	Không	Task, Project, Comment
Bảng 3.7. Cấu trúc collection Notification
- ActivityLog: Ghi nhận các hành động của user trên hệ thống (tạo, sửa, xóa, đăng nhập, đăng xuất), giúp kiểm soát lịch sử thao tác, hỗ trợ audit.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
user	ObjectId	Có	Người thực hiện hành động
action	String	Có	create, update, delete, login, logout
entityType	String	Có	Loại thực thể: User, Team, Project, Task, ...
entityId	ObjectId	Không	ID thực thể liên quan
metadata	Object	Không	Thông tin bổ sung
createdAt	Date	Không	Thời điểm thực hiện hành động
Bảng 3.8. Cấu trúc collection ActivityLog
- TimeLog: Ghi nhận thời gian làm việc của từng thành viên trên mỗi task, phục vụ thống kê hiệu suất cá nhân và nhóm.
Trường	Kiểu dữ liệu	Bắt buộc	Ý nghĩa/Chức năng
_id	ObjectId	Có	Khóa chính
task	ObjectId	Có	Liên kết tới Task
user	ObjectId	Có	Người ghi nhận thời gian
duration	Number	Có	Thời lượng làm việc (phút)
date	Date	Không	Ngày ghi nhận
description	String	Không	Mô tả thời gian làm việc
createdAt	Date	Không	Thời điểm tạo
Bảng 3.9. Cấu trúc collection TimeLog
Việc thiết kế mô hình dữ liệu theo hướng module hóa, liên kết các collection thông qua ObjectId giúp hệ thống dễ dàng mở rộng, bổ sung các trường mới, hoặc tích hợp thêm tính năng mà không ảnh hưởng đến dữ liệu cũ. Mỗi collection đều có trường thời gian tạo, cập nhật để hỗ trợ truy xuất lịch sử hoặc thống kê.
3.3. Thiết kế hệ thống
Về tổng thể, hệ thống được xây dựng theo mô hình ba lớp (Three-Tier Architecture): Presentation Layer (Frontend), Application Layer (Backend/API), Data Layer (MongoDB). Toàn bộ logic nghiệp vụ, xác thực, phân quyền, kiểm soát truy cập đều xử lý ở backend (Node.js + Express.js), đảm bảo dữ liệu luôn nhất quán, bảo mật, đồng thời tối ưu hiệu năng cho frontend.
- Frontend: Giao diện web xây dựng bằng HTML/CSS/JS, có thể sử dụng thêm thư viện như Bootstrap hoặc các framework như React để tăng tính tương tác, hỗ trợ responsive trên nhiều thiết bị. Tất cả các thao tác của người dùng như đăng nhập, tạo task, comment... đều gửi request đến API backend.
- Backend/API: Được xây dựng bằng Node.js kết hợp Express.js, tổ chức theo mô hình RESTful API, định nghĩa rõ ràng các endpoint cho từng nghiệp vụ (user, team, project, task, sub-task, comment, notification, ...). Backend chịu trách nhiệm xác thực user, phân quyền, kiểm tra điều kiện nghiệp vụ, thao tác với MongoDB thông qua Mongoose và trả về response phù hợp cho frontend.
- Database (MongoDB): Lưu trữ toàn bộ dữ liệu của hệ thống, hỗ trợ index để tăng tốc truy vấn, đảm bảo dữ liệu luôn nhất quán và sẵn sàng mở rộng khi số lượng user hoặc dữ liệu lớn lên.
Hệ thống chia nhỏ thành các module rõ ràng (models, controllers, routes, config...), áp dụng các pattern như Repository, Service, Middleware để dễ bảo trì, mở rộng, tích hợp thêm các dịch vụ bên ngoài hoặc chuyển đổi sang microservice khi cần. Các chức năng bảo mật như mã hóa mật khẩu, xác thực JWT, phân quyền, kiểm soát session đều được xử lý kỹ lưỡng tại backend, hạn chế tối đa nguy cơ tấn công hoặc rò rỉ dữ liệu. Việc thiết kế này không chỉ đảm bảo hệ thống hoạt động ổn định mà còn sẵn sàng đáp ứng các yêu cầu mở rộng, nâng cấp trong tương lai.
 
4. XÂY DỰNG HỆ THỐNG
Việc xây dựng hệ thống quản lý công việc với Node.js và MongoDB không chỉ đơn giản là hiện thực hóa các ý tưởng thiết kế mà còn phải đảm bảo quy trình triển khai khoa học, đồng bộ giữa các thành viên và tuân thủ các tiêu chuẩn kỹ thuật hiện đại. Ở phần này, nhóm trình bày chi tiết các bước thực hiện, từ khâu chuẩn bị môi trường, cài đặt thư viện, phát triển backend, frontend cho tới kiểm thử từng chức năng để đảm bảo hệ thống hoạt động ổn định, bảo mật và dễ dàng mở rộng về sau.
4.1. Chuẩn bị môi trường phát triển
Để đảm bảo hệ thống hoạt động ổn định và thuận tiện trong quá trình phát triển, nhóm lựa chọn các công cụ, nền tảng phù hợp với mục tiêu đề ra. Trước tiên, Node.js được cài đặt trên môi trường máy tính cá nhân hoặc máy chủ phát triển với phiên bản cập nhật mới nhất nhằm tận dụng tối đa các tính năng về quản lý gói, xử lý bất đồng bộ và hiệu năng cao. MongoDB có thể triển khai dưới dạng bản cài đặt local hoặc sử dụng dịch vụ đám mây (MongoDB Atlas) để thuận tiện chia sẻ, phối hợp giữa các thành viên trong nhóm.
Các công cụ hỗ trợ phát triển như Visual Studio Code (VSCode) giúp tăng hiệu suất lập trình, hỗ trợ gợi ý mã, kiểm soát version bằng Git, đồng thời tích hợp nhiều extension hữu ích cho JavaScript, Node.js. Ngoài ra, các thành viên sử dụng Postman hoặc Insomnia để kiểm thử API, đảm bảo các endpoint backend hoạt động đúng logic, trả về dữ liệu chính xác, hỗ trợ debug nhanh và phát hiện lỗi kịp thời. Việc chuẩn bị môi trường kỹ càng giúp tiết kiệm thời gian, tăng độ ổn định và hiệu quả hợp tác trong nhóm.
4.2. Cài đặt thư viện cần thiết
Khi môi trường phát triển đã sẵn sàng, nhóm tiến hành khởi tạo dự án với npm init, xây dựng cấu trúc thư mục hợp lý (models, routes, controllers, config, public…). Các thư viện cần thiết được cài đặt qua npm như:
- express: giúp xây dựng RESTful API một cách nhanh chóng, tổ chức các route dễ dàng.
- mongoose: làm cầu nối giữa Node.js và MongoDB, hỗ trợ định nghĩa schema, validate dữ liệu, thao tác với collection.
- bcryptjs: dùng để mã hóa, kiểm tra mật khẩu, đảm bảo an toàn bảo mật cho người dùng.
- jsonwebtoken (JWT): hỗ trợ tạo, xác thực token đăng nhập, phân quyền truy cập cho từng user.
- cors: cho phép hoặc hạn chế domain truy cập API, tăng bảo mật.
- nodemon: tự động reload server khi code thay đổi, giúp phát triển nhanh và hạn chế lỗi do quên khởi động lại server.
Ngoài các thư viện backend, nhóm còn cài đặt các thư viện frontend (nếu dùng React, Bootstrap, axios…), các thư viện hỗ trợ upload file (multer), gửi email (nodemailer) khi muốn mở rộng thêm chức năng thông báo, báo cáo.
4.3. Xây dựng backend
Khởi tạo server và kết nối MongoDB
Nhóm viết file server.js hoặc app.js để khởi tạo server Express, cấu hình các middleware xử lý JSON, CORS, đồng thời kết nối cơ sở dữ liệu MongoDB bằng Mongoose. Quá trình kết nối này sử dụng URL connection string, bảo mật thông tin truy cập qua file .env để thuận tiện triển khai đa môi trường.
Ví dụ:
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Các route sẽ được khai báo ở đây...

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
Định nghĩa models và schema
Các models đại diện cho các collection được định nghĩa rõ ràng trong thư mục models, bao gồm User, Team, Project, Task, Comment, Notification, TimeLog, ActivityLog… Mỗi schema đều có validate dữ liệu chặt chẽ (bắt buộc, unique, enum…), đảm bảo dữ liệu đầu vào luôn đúng chuẩn.
Ví dụ:
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
Xây dựng controllers và routes
Controllers xử lý logic nghiệp vụ cho từng chức năng: đăng ký, đăng nhập, phân quyền, tạo/sửa/xóa task, tạo project, thêm/xóa thành viên team, gửi bình luận, thống kê… Các routes định nghĩa endpoint, phân chia logic rõ ràng, áp dụng middleware xác thực JWT cho các route cần bảo vệ, middleware kiểm tra quyền admin, manager để giới hạn thao tác nhạy cảm (xóa user, phân quyền, …).
Chẳng hạn như khi người dùng gửi request tạo task, controller sẽ xác thực token, kiểm tra quyền, validate dữ liệu, lưu vào collection Task, đồng thời tạo notification cho người được giao việc và ghi lại log thao tác vào ActivityLog.
Ví dụ:
Controller
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Tạo mới task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lấy danh sách tất cả task
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee').populate('pro ject');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật task theo id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xóa task theo id
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
Route:
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);
Xử lý bảo mật và phân quyền
Tất cả mật khẩu đều được mã hóa bằng bcrypt trước khi lưu vào database. Hệ thống sử dụng JWT để xác thực và phân quyền truy cập, đảm bảo chỉ những user hợp lệ mới được thao tác dữ liệu của mình hoặc nhóm mình quản lý. Các middleware kiểm tra quyền admin, manager được áp dụng cho các route nhạy cảm như phân quyền, xóa user, sửa thông tin nhóm, project. Việc này góp phần bảo vệ an toàn dữ liệu và tránh lạm dụng tính năng gây rối hệ thống.
Ví dụ: 
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
4.4. Xây dựng frontend
Frontend là phần tiếp xúc trực tiếp với người dùng, cần đảm bảo giao diện thân thiện, dễ sử dụng, hỗ trợ thao tác nhanh và trực quan. Nhóm xây dựng frontend bằng HTML, CSS, JavaScript thuần hoặc kết hợp với các thư viện như Bootstrap để tăng tính thẩm mỹ, responsive. Đối với các nhóm có nhiều kinh nghiệm, có thể sử dụng ReactJS để xây dựng giao diện động, phân chia rõ ràng các component (task list, calendar, project board, comment box…).
Frontend gửi request (qua fetch API hoặc axios) tới các endpoint backend để thực hiện các thao tác như đăng nhập, đăng ký, tạo task, comment, upload file… Giao diện được thiết kế hợp lý, các form validate dữ liệu đầu vào trước khi gửi lên server, giúp giảm lỗi, tăng trải nghiệm người dùng. Các thông báo, trạng thái thành công thất bại, loading… được hiện thị rõ ràng để người dùng dễ nhận biết.
4.5. Kiểm thử chức năng chính
Sau khi hoàn thiện backend và frontend, nhóm tiến hành kiểm thử toàn bộ hệ thống theo từng tính năng đã thiết kế:
- Kiểm thử API bằng Postman: Đăng ký, đăng nhập, phân quyền, tạo/sửa/xóa task, project, team, comment, notification, thống kê, tìm kiếm, lọc, sắp xếp…
- Kiểm thử giao diện: Đảm bảo các thao tác trên web đều gửi đúng request, nhận đúng response, cập nhật giao diện chính xác theo trạng thái dữ liệu.
- Kiểm thử bảo mật: Đăng nhập với mật khẩu sai, token hết hạn, thử truy cập chức năng không phân quyền để đảm bảo hệ thống từ chối hợp lý.
- Kiểm thử hiệu năng: Thực hiện thao tác đồng thời từ nhiều tài khoản để kiểm tra khả năng đáp ứng, tối ưu lại các truy vấn, chỉ số index trên MongoDB nếu thấy chậm.
Các lỗi phát hiện trong quá trình kiểm thử đều được ghi lại, phân tích nguyên nhân, sửa chữa và kiểm tra lại nhiều lần để hệ thống đạt độ ổn định trước khi tổng kết, đánh giá và đề xuất hướng phát triển tiếp theo.
 
5. KẾT QUẢ ĐẠT ĐƯỢC
Sau quá trình phát triển, kiểm thử và hoàn thiện, hệ thống quản lý công việc sử dụng Node.js và MongoDB đã đạt được nhiều kết quả tích cực cả về mặt kỹ thuật lẫn thực tiễn. Ở phần này, nhóm trình bày chi tiết các chức năng đã hoàn thiện, đánh giá hiệu quả hoạt động của hệ thống, đồng thời minh họa kết quả thông qua các ví dụ thực tế và mô tả giao diện.
5.1. Các chức năng đã thực hiện
Hệ thống đã triển khai đầy đủ các chức năng cốt lõi của một nền tảng quản lý công việc hiện đại:
Xác thực và phân quyền người dùng: Hệ thống hỗ trợ đăng ký, đăng nhập, đăng xuất. Quản lý vai trò gồm admin, manager, thành viên thường; mỗi vai trò có quyền hạn và phạm vi truy cập khác nhau. Chỉ những người dùng hợp lệ, có token xác thực mới thao tác được với dữ liệu riêng tư hoặc dữ liệu nhóm.
Quản lý công việc (Task và Sub-task): Người dùng có thể tạo mới, chỉnh sửa, xóa công việc chính và công việc con một cách linh hoạt. Hệ thống cho phép gán người thực hiện, thay đổi trạng thái (chưa làm, đang làm, đã hoàn thành), đặt deadline, phân loại theo mức độ ưu tiên, đồng thời hỗ trợ hiển thị công việc trên giao diện lịch và bản danh sách.
Quản lý dự án và nhóm làm việc (Project/Team): Cho phép tạo, sửa, xóa dự án, gán dự án cho nhóm hoặc thành viên, thống kê tiến độ từng dự án, quản lý danh sách thành viên nhóm và vai trò từng người. Việc phân quyền trong team đảm bảo tính minh bạch và kiểm soát tốt tiến độ công việc.
Tương tác và cộng tác: Hệ thống hỗ trợ bình luận theo dạng thread trên từng task hoặc sub-task, giúp các thành viên thảo luận, phản hồi trực tiếp. Chức năng gửi file đính kèm, ảnh minh họa, tải lên/tải xuống tài liệu liên quan đến công việc đã được xây dựng hoàn chỉnh.
Tìm kiếm, lọc, sắp xếp: Người dùng có thể tìm kiếm công việc theo từ khóa, trạng thái, người giao, ưu tiên, thời hạn. Hệ thống hỗ trợ lọc và sắp xếp danh sách task để dễ dàng theo dõi, quản lý khối lượng công việc lớn.
Thông báo và thống kê: Khi có task mới, comment mới, deadline gần đến, hệ thống sẽ gửi thông báo tới người liên quan. Đồng thời, chức năng thống kê giúp quản lý hoặc thành viên nắm bắt số lượng công việc hoàn thành, đang làm, trễ hạn theo từng ngày, tuần, tháng.
Quản lý người dùng: Hiển thị danh sách người dùng, cho phép admin khóa tài khoản hoặc phân quyền, xem danh sách công việc của từng người, đảm bảo quản trị hệ thống hiệu quả.
Ghi nhận thời gian làm việc (TimeLog): Hệ thống ghi nhận chi tiết thời gian làm việc của từng thành viên trên mỗi task, phục vụ thống kê hiệu suất cá nhân và nhóm.
5.2. Hiệu quả hoạt động và minh họa thực tế
Quá trình kiểm thử cho thấy hệ thống vận hành ổn định, phản hồi nhanh, giao diện thân thiện, thao tác đơn giản. Các chức năng tạo/sửa/xóa task, giao việc, chuyển trạng thái, bình luận, upload file… đều hoạt động trơn tru, dữ liệu được đồng bộ tức thời giữa backend và frontend.
Khi một task mới được tạo và giao cho thành viên, hệ thống tự động gửi thông báo đến người nhận, đồng thời ghi lại log thao tác để quản trị viên dễ dàng kiểm tra lịch sử hoạt động. Thao tác chỉnh sửa, xóa task hoặc thay đổi deadline được cập nhật ngay trên giao diện lịch, hỗ trợ người dùng dễ dàng theo dõi tiến độ công việc. Các tính năng tìm kiếm, lọc, sắp xếp giúp người dùng nhanh chóng tìm được công việc cần thiết, ngay cả khi quản lý số lượng task lớn.
Chức năng bình luận, gửi file đính kèm, trả lời bình luận cha giúp nâng cao khả năng cộng tác nhóm. Các hoạt động như thêm thành viên vào team, đổi vai trò, tạo/sửa project đều được kiểm soát chặt chẽ qua phân quyền, đảm bảo an toàn dữ liệu.
5.3. Đánh giá tổng quan
Tính đúng đắn: Các chức năng vận hành chính xác theo thiết kế, không xuất hiện lỗi nghiêm trọng trong quá trình kiểm thử.
Tính ổn định: Hệ thống hoạt động ổn định với số lượng user thử nghiệm trên môi trường local và cloud, không bị crash hoặc treo server khi thao tác đồng thời từ nhiều tài khoản.
Bảo mật: Mật khẩu được mã hóa an toàn, xác thực JWT bảo vệ các API, phân quyền chặt chẽ giúp giới hạn quyền truy cập dữ liệu.
Khả năng mở rộng: Mô hình dữ liệu linh hoạt, dễ bổ sung thêm trường mới hoặc mở rộng các chức năng nâng cao mà không ảnh hưởng dữ liệu cũ.
Trải nghiệm người dùng: Giao diện dễ sử dụng, các thao tác chính được trình bày rõ ràng, thông báo và phản hồi hệ thống kịp thời, giúp người dùng nắm bắt tiến độ công việc và phối hợp tốt trong nhóm.
Tổng kết lại, hệ thống quản lý công việc do nhóm phát triển đã hoàn thành các mục tiêu đề ra, sẵn sàng làm nền tảng để tiếp tục mở rộng thêm nhiều tính năng mới, phục vụ đa dạng nhu cầu quản lý công việc trong thực tế.
 
6. ĐÁNH GIÁ, KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
Quá trình phát triển hệ thống quản lý công việc với Node.js và MongoDB không chỉ giúp nhóm nâng cao năng lực chuyên môn ở các khía cạnh kỹ thuật mà còn mang lại nhiều bài học thực tiễn về làm việc nhóm, giải quyết vấn đề và thích ứng linh hoạt với thay đổi trong dự án phần mềm. Ở phần này, nhóm sẽ phân tích sâu các thuận lợi, khó khăn gặp phải, kinh nghiệm rút ra, đồng thời đề xuất các hướng phát triển tương lai dựa trên nền tảng hệ thống đã xây dựng.
6.1. Những thuận lợi và khó khăn
Thuận lợi:
Một trong những thuận lợi lớn nhất là công nghệ Node.js và MongoDB đều rất phổ biến, có cộng đồng hỗ trợ rộng lớn, tài liệu hướng dẫn phong phú, nhiều ví dụ thực tế và dự án mã nguồn mở để học hỏi. Điều này giúp nhóm dễ dàng tra cứu, giải quyết các vấn đề kỹ thuật, đồng thời chọn được các thư viện, công cụ phù hợp nhất cho từng chức năng. Việc sử dụng JavaScript xuyên suốt từ backend đến frontend không chỉ giúp thống nhất ngôn ngữ phát triển mà còn rút ngắn thời gian làm quen công nghệ cho các thành viên, tăng hiệu quả phối hợp nhóm.
Khả năng mở rộng của MongoDB cùng mô hình RESTful API của Node.js giúp hệ thống dễ dàng tích hợp, bổ sung các tính năng mới mà không ảnh hưởng tới dữ liệu cũ; đồng thời thuận tiện cho việc bảo trì, nâng cấp hoặc chuyển đổi sang cấu trúc microservices khi quy mô dự án tăng lên. Quá trình làm việc nhóm được quản lý hiệu quả nhờ phân công nhiệm vụ rõ ràng, sử dụng Git để kiểm soát phiên bản, giảm thiểu xung đột mã nguồn và tăng tính minh bạch trong đóng góp từng cá nhân.
Khó khăn:
Bên cạnh thuận lợi, nhóm cũng gặp không ít khó khăn, đặc biệt là vấn đề bảo mật, phân quyền chi tiết, kiểm thử trên nhiều môi trường khác nhau. Việc triển khai xác thực người dùng qua JWT, mã hóa mật khẩu bằng bcryptjs đòi hỏi phải hiểu sâu về quy trình xác thực, lưu trữ token an toàn, xử lý timeout, làm mới token và chống tấn công XSS, CSRF… Một số lỗi phát sinh do thiếu validate ở backend hoặc lỗi logic khi phân quyền (ví dụ: user thường truy cập API của admin) đòi hỏi nhóm phải debug kỹ, bổ sung các middleware kiểm tra quyền truy cập, nâng cao an toàn cho toàn hệ thống.
Ngoài ra, việc kiểm thử hiệu năng khi nhiều người dùng thao tác đồng thời, kiểm soát trạng thái đồng bộ dữ liệu giữa các client, tối ưu truy vấn MongoDB khi số lượng task lớn cũng là thách thức. Đặc biệt, khi triển khai thao tác phức tạp như thống kê, lọc, tìm kiếm nâng cao, nhóm phải xây dựng chỉ số index hợp lý, sử dụng các phương thức aggregate hiệu quả để tránh làm giảm tốc độ toàn hệ thống.
6.2. Bài học kinh nghiệm
Thông qua quá trình thực hiện, nhóm rút ra nhiều bài học quý báu. Đầu tiên, việc xác định yêu cầu nghiệp vụ rõ ràng, phân chia công việc cụ thể, tổ chức họp nhóm định kỳ, cập nhật tiến độ thường xuyên là yếu tố tiên quyết để đảm bảo dự án đi đúng hướng, giảm thiểu lãng phí thời gian do hiểu nhầm hoặc bỏ sót chức năng. Thứ hai, mỗi thành viên cần chủ động nghiên cứu tài liệu chuẩn, học hỏi từ các dự án mã nguồn mở, không ngại thảo luận, chia sẻ khó khăn để cùng nhau giải quyết vấn đề.
Việc kiểm thử liên tục (continuous testing), phát hiện và sửa lỗi sớm, xây dựng các test case chi tiết cho từng API, từng luồng thao tác trên frontend giúp giảm thiểu rủi ro lỗi logic, nâng cao độ ổn định của hệ thống. Sử dụng Git cho quản lý mã nguồn, phân nhánh (branching) hợp lý để mỗi thành viên phát triển độc lập, sau đó hợp nhất lại, giúp dự án luôn ở trạng thái ổn định, dễ dàng rollback khi cần thiết.
Cuối cùng, nhóm nhận ra rằng việc chú trọng bảo mật, validate dữ liệu đầu vào, kiểm soát quyền truy cập và ghi log hoạt động là những yếu tố không thể thiếu để duy trì sự an toàn, minh bạch cho hệ thống, nhất là khi triển khai trong môi trường thực tế với nhiều người dùng.
6.3. Hướng phát triển trong tương lai
Dựa trên nền tảng hệ thống đã xây dựng, nhóm xác định nhiều hướng phát triển tiềm năng để đáp ứng nhu cầu ngày càng cao của người dùng:
Tích hợp chức năng nâng cao: Bổ sung nhắc việc qua email, thông báo real-time (push notification), chat nội bộ, xuất báo cáo chuyên sâu theo từng dự án, nhóm, cá nhân. Phát triển dashboard trực quan giúp quản trị viên và thành viên nhanh chóng nắm bắt tiến độ, hiệu suất làm việc.
Nâng cấp bảo mật: Áp dụng xác thực hai lớp (2FA), phân quyền động dựa trên vai trò, theo dõi và ghi log chi tiết toàn bộ hoạt động người dùng, tích hợp hệ thống cảnh báo khi có thao tác bất thường hoặc truy cập trái phép.
Triển khai online, tối ưu vận hành: Đưa hệ thống lên các nền tảng cloud (AWS, Azure, GCP), sử dụng Docker để đóng gói, triển khai CI/CD tự động, giúp bảo trì, nâng cấp dễ dàng, tối ưu chi phí vận hành. Tăng khả năng chịu tải bằng cách tối ưu cache, load balancing, phân mảnh database khi quy mô mở rộng.
Mở rộng đa nền tảng: Phát triển ứng dụng mobile (React Native, Flutter) đồng bộ với hệ thống web, tối ưu giao diện responsive cho nhiều thiết bị, hỗ trợ làm việc mọi lúc, mọi nơi.
Tích hợp trí tuệ nhân tạo: Ứng dụng AI vào gợi ý tự động phân bổ công việc, dự báo deadline, nhắc nhở thông minh, phân tích hiệu suất cá nhân/nhóm, tăng trải nghiệm người dùng.
Những định hướng này sẽ giúp hệ thống không chỉ dừng lại ở một công cụ quản lý công việc đơn thuần mà còn trở thành nền tảng hỗ trợ cộng tác, điều phối, phát triển đội nhóm chuyên nghiệp trong môi trường hiện đại.
 
7. TÀI LIỆU THAM KHẢO
[1] Node.js Documentation: https://nodejs.org/en/docs/
[2] MongoDB Documentation: https://www.mongodb.com/docs/
[3] Express.js Guide: https://expressjs.com/
[4] Mongoose Documentation: https://mongoosejs.com/docs/
[5] Django REST Framework: https://www.django-rest-framework.org/
[6] Bootstrap Documentation: https://getbootstrap.com/docs/
[7] https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/
[8] https://www.techtarget.com/searchsoftwarequality/definition/performance-testing

	
 
PHỤ LỤC
