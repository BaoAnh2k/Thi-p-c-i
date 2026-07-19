# Thiệp online Lễ Vu Quy — Thu Hằng & Xuân Trường

Bộ code là một thiết kế mới, lấy cảm hứng từ trải nghiệm của mẫu tham khảo: màn hình mở thiệp, nhạc nền, hiệu ứng cánh hoa, chuyển động khi cuộn, parallax, đếm ngược, album, lưu lịch, chỉ đường, RSVP và hộp mừng cưới.

## Mở thử trên máy

Không nên bấm trực tiếp file `index.html` vì một số trình duyệt chặn âm thanh hoặc tính năng khi chạy dạng `file://`.

### Cách nhanh trên macOS

1. Mở Terminal.
2. Kéo thư mục này vào Terminal sau lệnh `cd `.
3. Chạy:

```bash
python3 -m http.server 8000
```

4. Mở `http://localhost:8000`.

## Thay ảnh

Thay đúng tên file trong `assets/images/`:

- `cover.jpg`: ảnh bìa dọc, nên dùng 1600 × 2400 px.
- `invite-bg.jpg`: ảnh nền phần mời khách, nên dùng ảnh ngang.
- `bride.jpg`: ảnh cô dâu dọc.
- `groom.jpg`: ảnh chú rể dọc.
- `gallery-1.jpg` đến `gallery-8.jpg`: album.
- `location.jpg`: ảnh nền phần địa điểm.
- `closing.jpg`: ảnh kết trang.
- `og-cover.jpg`: ảnh hiển thị khi chia sẻ link Facebook/Zalo.

Giữ nguyên tên file để không cần sửa code. Có thể dùng JPG, nhưng nên nén mỗi ảnh còn khoảng 200–500 KB để trang tải nhanh.

## Thay nhạc

Thay file `assets/audio/nhac-cuoi.mp3` bằng bài nhạc của bạn và giữ nguyên tên.

## Chỉnh nội dung

Thông tin quan trọng nằm trong `assets/js/config.js`:

- Tên cô dâu, chú rể.
- Ngày giờ tiệc và Lễ Vu Quy.
- Địa chỉ và từ khóa Google Maps.
- Đường dẫn nhận RSVP.
- Thông tin tài khoản mừng cưới.

Nội dung trình bày dài nằm trong `index.html` và có chú thích rõ theo từng section.

## Cá nhân hóa tên khách

Dùng tham số `guest` trong URL:

```text
https://ten-mien-cua-ban.com/?guest=Bạn%20Bảo%20Anh
```

Trang cũng nhận `to=` hoặc `khach=`.

## Nhận xác nhận RSVP trực tuyến

Mặc định, biểu mẫu chỉ lưu phản hồi trên thiết bị của khách. Để nhận dữ liệu, điền URL Formspree hoặc Google Apps Script vào `rsvpEndpoint` trong `assets/js/config.js`.

## Đưa lên mạng miễn phí bằng GitHub Pages

1. Tạo repository mới trên GitHub.
2. Tải toàn bộ **nội dung bên trong thư mục** này lên repository.
3. Vào **Settings → Pages**.
4. Chọn **Deploy from a branch**, nhánh `main`, thư mục `/root`.
5. Chờ GitHub tạo đường dẫn công khai.

## Lưu ý

- Hãy thay thông tin ngân hàng mẫu trước khi công khai website.
- Google Maps hiện tìm theo địa chỉ chữ. Khi có pin chính xác, thay `mapQuery` bằng tọa độ dạng `11.12345,108.12345` để chỉ đường đúng hơn.
- File nhạc đi kèm là âm thanh yên lặng ngắn để nút nhạc hoạt động ngay; hãy thay bằng bài nhạc thật.


## Phối màu phiên bản này

Phiên bản V3 dùng đỏ ruby, đỏ vang đậm và vàng champagne để giao diện nổi bật, sang trọng hơn. Có thể đổi nhanh các biến màu ở đầu file `assets/css/style.css`.
