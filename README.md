-Dữ liệu của server license gồm dữ liệu khách hàng và dữ liệu license.
-Quy trình là tạo KH trước rồi đến tạo license cho KH đó, 1 KH có thể có nhiều license.
Ban đầu khi tạo thì licenseKey trống, dùng api generate_license để tạo mới 1 licenseKey, sau đó update vào license đã tạo trước đó để lưu trữ.
-Để đơn giản hóa thì không quản lý sản phẩm, do đó thống nhất tạo CustomerName theo cấu trúc: {{Product}}_{{CustomerName}} .Ví dụ ivms_test1
-Thời gian expire của licensekey khi tạo sử dụng cấu trúc string mô tả trong package này: https://github.com/vercel/ms
-Khi verify một license, sẽ có 3 giá trị có thể trả về gồm expired/valid/invalid
