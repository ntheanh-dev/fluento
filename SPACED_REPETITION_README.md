# Spaced Repetition System trong Fluento

## Tổng quan

Spaced Repetition (Lặp lại có khoảng cách) là một kỹ thuật học tập dựa trên nghiên cứu về trí nhớ của Hermann Ebbinghaus. Phương pháp này tối ưu hóa việc học bằng cách lặp lại thông tin vào những thời điểm tối ưu, giúp củng cố trí nhớ dài hạn và giảm thiểu thời gian học tập.

## Nguyên lý hoạt động

### 1. Forgetting Curve (Đường cong quên lãng)
- Con người quên 50% thông tin sau 1 giờ
- Quên 90% thông tin sau 1 tuần nếu không ôn tập
- Spaced Repetition giúp "làm phẳng" đường cong này

### 2. Spacing Effect (Hiệu ứng khoảng cách)
- Ôn tập nhiều lần với khoảng cách thời gian tăng dần
- Mỗi lần ôn tập thành công → tăng khoảng cách lần sau
- Mỗi lần ôn tập thất bại → giảm khoảng cách lần sau

## Các Entity trong hệ thống Fluento

### 1. Note (Ghi chú)
```typescript
interface Note {
  id: number;
  noteTypeId: number;
  deckId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  fieldValues: Record<string, string>;
  cards: Card[];
  due?: string; // Thời gian học tiếp theo
}
```

**Mô tả**: Đơn vị cơ bản chứa thông tin cần học (từ vựng, câu hỏi, v.v.)

### 2. Card (Thẻ)
```typescript
interface Card {
  id: number;
  noteId: number;
  cardType: 'BASIC' | 'CLOZE' | 'REVERSE';
  frontTemplate: string;
  backTemplate: string;
  createdAt: string;
  fieldValues?: Record<string, string>;
  stats?: CardStats;
}
```

**Mô tả**: 
- Một Note có thể tạo ra nhiều Card
- Mỗi Card có mặt trước (câu hỏi) và mặt sau (câu trả lời)
- Các loại Card:
  - **BASIC**: Thẻ cơ bản (câu hỏi → câu trả lời)
  - **CLOZE**: Thẻ điền vào chỗ trống
  - **REVERSE**: Thẻ ngược (câu trả lời → câu hỏi)

### 3. CardStats (Thống kê thẻ)
```typescript
interface CardStats {
  easeFactor: number;        // Hệ số dễ dàng (2.50 mặc định)
  intervalDays: number;      // Số ngày đến lần ôn tiếp theo
  repetitions: number;       // Số lần đã ôn tập thành công
  lapses: number;           // Số lần ôn tập thất bại
  dueDate: string;          // Thời gian đến hạn ôn tập
  lastReviewedAt?: string;  // Thời gian ôn tập lần cuối
}
```

**Mô tả**: Lưu trữ thông tin học tập của từng Card cho mỗi User

### 4. Review (Đánh giá)
```typescript
interface Review {
  id: number;
  cardId: number;
  userId: number;
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASE';
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
  reviewTimeMs: number;
  createdAt: string;
}
```

**Mô tả**: Lưu trữ lịch sử đánh giá của mỗi lần ôn tập

## Thuật toán Spaced Repetition

### 1. Khởi tạo Card mới
```java
private void createInitialCardStats(Long cardId, Long userId) {
    CardStats stats = new CardStats();
    stats.setCardId(cardId);
    stats.setUserId(userId);
    stats.setEaseFactor(new BigDecimal("2.50")); // Hệ số dễ dàng ban đầu
    stats.setIntervalDays(1);                    // Ôn tập sau 1 ngày
    stats.setRepetitions(0);                     // Chưa ôn tập lần nào
    stats.setLapses(0);                          // Chưa thất bại lần nào
    stats.setDueDate(LocalDateTime.now());       // Ôn tập ngay
    stats.setLastReviewedAt(null);
    
    cardStatsRepository.save(stats);
}
```

### 2. Cập nhật sau khi ôn tập
```java
public void updateCardStats(Long cardId, Long userId, String rating) {
    CardStats stats = cardStatsRepository.findByCardIdAndUserId(cardId, userId);
    
    switch (rating) {
        case "AGAIN":
            stats.setLapses(stats.getLapses() + 1);
            stats.setIntervalDays(1); // Ôn tập lại sau 1 ngày
            stats.setRepetitions(0);  // Reset số lần ôn tập
            break;
            
        case "HARD":
            stats.setIntervalDays(Math.max(1, stats.getIntervalDays() * 1.2));
            stats.setEaseFactor(Math.max(1.3, stats.getEaseFactor() - 0.15));
            break;
            
        case "GOOD":
            stats.setIntervalDays(stats.getIntervalDays() * stats.getEaseFactor());
            stats.setRepetitions(stats.getRepetitions() + 1);
            break;
            
        case "EASY":
            stats.setIntervalDays(stats.getIntervalDays() * stats.getEaseFactor() * 1.3);
            stats.setEaseFactor(Math.min(2.5, stats.getEaseFactor() + 0.15));
            stats.setRepetitions(stats.getRepetitions() + 1);
            break;
    }
    
    // Cập nhật thời gian đến hạn
    stats.setDueDate(LocalDateTime.now().plusDays(stats.getIntervalDays()));
    stats.setLastReviewedAt(LocalDateTime.now());
    
    cardStatsRepository.save(stats);
}
```

## Các mức đánh giá

| Rating | Ý nghĩa | Hành động |
|--------|---------|-----------|
| **AGAIN** | Quên hoàn toàn | Reset về ngày đầu, giảm ease factor |
| **HARD** | Nhớ được nhưng khó | Tăng interval nhẹ, giảm ease factor |
| **GOOD** | Nhớ được bình thường | Tăng interval theo ease factor |
| **EASY** | Nhớ được dễ dàng | Tăng interval nhiều, tăng ease factor |

## Công thức tính toán

### 1. Ease Factor (Hệ số dễ dàng)
- **Ban đầu**: 2.50
- **Tăng**: +0.15 khi đánh giá EASY
- **Giảm**: -0.15 khi đánh giá HARD
- **Giới hạn**: 1.30 ≤ easeFactor ≤ 2.50

### 2. Interval (Khoảng cách)
- **AGAIN**: interval = 1 ngày
- **HARD**: interval = interval × 1.2
- **GOOD**: interval = interval × easeFactor
- **EASY**: interval = interval × easeFactor × 1.3

### 3. Due Date (Thời gian đến hạn)
```
dueDate = lastReviewedAt + intervalDays
```

## Lợi ích của Spaced Repetition

### 1. Hiệu quả học tập
- **Tăng 200-400%** khả năng ghi nhớ dài hạn
- **Giảm 50-70%** thời gian học tập tổng thể
- **Tối ưu hóa** thời gian ôn tập

### 2. Tâm lý học tập
- Giảm cảm giác "quá tải" thông tin
- Tăng động lực học tập
- Cảm giác thành công khi nhớ được

### 3. Ứng dụng thực tế
- Học từ vựng ngoại ngữ
- Ôn tập kiến thức học thuật
- Ghi nhớ công thức, định lý
- Học thuộc lòng thơ, văn

## Cách sử dụng trong Fluento

### 1. Tạo Note và Card
1. Chọn Deck để chứa Note
2. Chọn NoteType (loại ghi chú)
3. Điền thông tin vào các Field
4. Hệ thống tự động tạo Card với CardStats

### 2. Ôn tập hàng ngày
1. Vào Study Session
2. Hệ thống hiển thị các Card đến hạn
3. Đánh giá mức độ nhớ của mình
4. Hệ thống cập nhật lịch ôn tập tiếp theo

### 3. Theo dõi tiến độ
- Xem thống kê học tập
- Theo dõi số lượng Card đã học
- Kiểm tra lịch ôn tập sắp tới

## Tài liệu tham khảo

1. **Ebbinghaus, H. (1885)**. Über das Gedächtnis. Untersuchungen zur experimentellen Psychologie.
2. **Cepeda, N. J. et al. (2006)**. Distributed practice in verbal recall tasks: A review and quantitative synthesis.
3. **Karpicke, J. D. & Roediger, H. L. (2008)**. The critical importance of retrieval for learning.
4. **Anki Manual**: https://docs.ankiweb.net/

## Kết luận

Spaced Repetition là một phương pháp học tập khoa học và hiệu quả, được tích hợp hoàn toàn vào hệ thống Fluento. Với việc sử dụng thuật toán tối ưu và giao diện thân thiện, người dùng có thể học tập một cách hiệu quả và bền vững.

---

*Tài liệu này được tạo ra để giúp người dùng hiểu rõ về hệ thống Spaced Repetition trong Fluento và cách sử dụng hiệu quả.*
