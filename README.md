# Bé Học Tiếng Anh 🎓

Website học tiếng Anh vừa học vừa chơi cho trẻ beginner. Thuần HTML/CSS/JS, không cần build, dữ liệu lưu trên máy (localStorage), có thể cài như app (PWA) và dùng offline.

## Chạy thử
```bash
python3 -m http.server 8000   # hoặc: npx serve .
# mở http://localhost:8000
```
(Micro, thông báo và service worker cần `localhost` hoặc HTTPS.)

## Tính năng
- **8 chủ đề**: đá bóng, game, câu cá, cờ vua, đánh trống, piano, cuộc sống thường ngày, TikTok (mỗi chủ đề 8 từ + 1 bài đọc).
- **5 bước học theo thứ tự**: Học từ mới → Luyện nghe → Luyện phát âm → Đọc hiểu → Kiểm tra.
- **Luyện phát âm** bằng Web Speech API (Chrome/Edge/Safari); trình duyệt không hỗ trợ sẽ chuyển sang chế độ nghe mẫu và tự đánh giá.
- **Lưu & lặp lại**: lưu từ yêu thích (❤️) và ôn tập ngắt quãng kiểu Leitner (1-2-4-7-14 ngày) ở mục "Ôn tập".
- **Nhắc nhở hằng ngày**: thông báo theo giờ chọn, mục tiêu bài/ngày, chuỗi ngày học 🔥, xuất file lịch `.ics` lặp hằng ngày.
- **Thưởng**: điểm, xu, sao (1-3 sao mỗi bước), cấp độ, huy hiệu, cửa hàng nhân vật.

## Thêm nội dung
Chỉnh `js/data.js`: thêm chủ đề vào mảng `TOPICS` theo cùng định dạng.

## Lưu ý
Thông báo trình duyệt chỉ hiện khi app đang mở hoặc đã cài vào màn hình chính; để chắc chắn nhận nhắc nhở, dùng nút "Thêm vào lịch điện thoại" trong Cài đặt. Chưa có tài khoản/đồng bộ nhiều thiết bị.
