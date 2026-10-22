// Nội dung bài học. Mỗi chủ đề: 8 từ vựng + 1 bài đọc ngắn có 3 câu hỏi.
// w: [từ tiếng Anh, nghĩa tiếng Việt, emoji, câu ví dụ, nghĩa câu ví dụ]
const TOPICS = [
  {
    id: 'football', name: 'Đá bóng', emoji: '⚽', color: '#34c759',
    words: [
      ['ball', 'quả bóng', '⚽', 'I kick the ball.', 'Mình sút quả bóng.'],
      ['goal', 'khung thành / bàn thắng', '🥅', 'He scores a goal.', 'Bạn ấy ghi một bàn thắng.'],
      ['kick', 'đá, sút', '🦵', 'Kick the ball to me.', 'Hãy đá bóng cho mình.'],
      ['team', 'đội', '👥', 'We are a good team.', 'Chúng mình là một đội tốt.'],
      ['run', 'chạy', '💨', 'I run fast.', 'Mình chạy nhanh.'],
      ['shoes', 'đôi giày', '👟', 'I wear my new shoes.', 'Mình mang đôi giày mới.'],
      ['win', 'chiến thắng', '🥇', 'We win the game!', 'Chúng mình thắng trận đấu!'],
      ['referee', 'trọng tài', '🧑‍⚖️', 'The referee blows the whistle.', 'Trọng tài thổi còi.'],
    ],
    reading: {
      title: 'The Football Game',
      text: ['Tom has a ball.', 'He plays football with his team.', 'Tom runs and kicks the ball.', 'Goal! His team wins the game.'],
      vi: 'Tom có một quả bóng. Bạn ấy chơi bóng với đội của mình. Tom chạy và sút bóng. Vào rồi! Đội của bạn ấy thắng trận.',
      qs: [
        { q: 'What does Tom have?', o: ['A ball', 'A fish', 'A piano'], a: 0 },
        { q: 'Who does Tom play with?', o: ['His mom', 'His team', 'His dog'], a: 1 },
        { q: 'Who wins the game?', o: ['The other team', 'Nobody', "Tom's team"], a: 2 },
      ],
    },
  },
  {
    id: 'game', name: 'Chơi game', emoji: '🎮', color: '#af52de',
    words: [
      ['controller', 'tay cầm chơi game', '🎮', 'I hold the controller.', 'Mình cầm tay cầm chơi game.'],
      ['computer', 'máy tính', '💻', 'I play on my computer.', 'Mình chơi trên máy tính.'],
      ['coin', 'đồng xu', '🪙', 'I get a gold coin.', 'Mình nhận một đồng xu vàng.'],
      ['jump', 'nhảy', '🦘', 'The hero can jump high.', 'Anh hùng có thể nhảy cao.'],
      ['score', 'điểm số', '💯', 'My score is one hundred.', 'Điểm của mình là một trăm.'],
      ['level', 'màn chơi, cấp độ', '🪜', 'This level is easy.', 'Màn này dễ.'],
      ['monster', 'quái vật', '👾', 'The monster is big.', 'Con quái vật to lớn.'],
      ['heart', 'trái tim, mạng sống', '❤️', 'I have three hearts.', 'Mình có ba mạng.'],
    ],
    reading: {
      title: 'My Favorite Game',
      text: ['I love my game.', 'I jump and get coins.', 'A big monster comes!', 'I win and my score is high.'],
      vi: 'Mình yêu trò chơi của mình. Mình nhảy và lấy đồng xu. Một con quái vật to xuất hiện! Mình thắng và điểm số rất cao.',
      qs: [
        { q: 'What does the player get?', o: ['Coins', 'Shoes', 'Books'], a: 0 },
        { q: 'What comes in the game?', o: ['A bus', 'A big monster', 'A drum'], a: 1 },
        { q: 'At the end, the score is…', o: ['Low', 'Zero', 'High'], a: 2 },
      ],
    },
  },
  {
    id: 'fishing', name: 'Câu cá', emoji: '🎣', color: '#0a84ff',
    words: [
      ['fish', 'con cá', '🐟', 'I see a fish.', 'Mình thấy một con cá.'],
      ['rod', 'cần câu', '🎣', 'Dad has a long rod.', 'Bố có một cần câu dài.'],
      ['boat', 'con thuyền', '⛵', 'We sit in a boat.', 'Chúng mình ngồi trên thuyền.'],
      ['river', 'dòng sông', '🏞️', 'The river is quiet.', 'Dòng sông yên tĩnh.'],
      ['worm', 'con giun (mồi câu)', '🪱', 'A fish likes a worm.', 'Cá thích con giun.'],
      ['net', 'cái vợt, lưới', '🕸️', 'I catch it with a net.', 'Mình bắt nó bằng vợt.'],
      ['water', 'nước', '💧', 'The water is cold.', 'Nước lạnh.'],
      ['bucket', 'cái xô', '🪣', 'Put the fish in the bucket.', 'Bỏ con cá vào xô.'],
    ],
    reading: {
      title: 'Fishing with Dad',
      text: ['Dad and I go to the river.', 'We sit in a small boat.', 'I put a worm on the rod.', 'I catch a big fish!'],
      vi: 'Bố và mình ra sông. Chúng mình ngồi trên chiếc thuyền nhỏ. Mình gắn con giun vào cần câu. Mình câu được một con cá to!',
      qs: [
        { q: 'Where do they go?', o: ['To the river', 'To school', 'To the park'], a: 0 },
        { q: 'What do they sit in?', o: ['A bus', 'A small boat', 'A bed'], a: 1 },
        { q: 'What does the boy catch?', o: ['A shoe', 'A ball', 'A big fish'], a: 2 },
      ],
    },
  },
  {
    id: 'chess', name: 'Cờ vua', emoji: '♟️', color: '#636366',
    words: [
      ['king', 'quân vua', '🤴', 'The king is important.', 'Quân vua rất quan trọng.'],
      ['queen', 'quân hậu', '👸', 'The queen is strong.', 'Quân hậu rất mạnh.'],
      ['knight', 'quân mã', '🐴', 'The knight jumps.', 'Quân mã nhảy.'],
      ['castle', 'quân xe (lâu đài)', '🏰', 'The castle moves straight.', 'Quân xe đi thẳng.'],
      ['pawn', 'quân tốt', '♟️', 'A pawn moves one step.', 'Quân tốt đi một bước.'],
      ['board', 'bàn cờ', '🔲', 'Put the pieces on the board.', 'Đặt quân lên bàn cờ.'],
      ['black', 'màu đen', '⚫', 'I play with black.', 'Mình chơi quân đen.'],
      ['white', 'màu trắng', '⚪', 'White moves first.', 'Quân trắng đi trước.'],
    ],
    reading: {
      title: 'Let’s Play Chess',
      text: ['I have a chess board.', 'White moves first.', 'My pawn moves one step.', 'I protect my king.'],
      vi: 'Mình có một bàn cờ vua. Quân trắng đi trước. Quân tốt của mình đi một bước. Mình bảo vệ quân vua.',
      qs: [
        { q: 'Who moves first?', o: ['Black', 'White', 'The king'], a: 1 },
        { q: 'How far does the pawn move?', o: ['One step', 'Ten steps', 'It cannot move'], a: 0 },
        { q: 'What does the boy protect?', o: ['His shoes', 'His fish', 'His king'], a: 2 },
      ],
    },
  },
  {
    id: 'drums', name: 'Đánh trống', emoji: '🥁', color: '#ff453a',
    words: [
      ['drum', 'cái trống', '🥁', 'I play the drum.', 'Mình đánh trống.'],
      ['stick', 'dùi trống', '🥢', 'I hold two sticks.', 'Mình cầm hai chiếc dùi.'],
      ['loud', 'ồn, to', '📢', 'The drum is loud.', 'Tiếng trống rất to.'],
      ['soft', 'nhẹ nhàng', '🤫', 'Play soft now.', 'Bây giờ chơi nhẹ thôi.'],
      ['beat', 'nhịp', '💓', 'I keep the beat.', 'Mình giữ nhịp.'],
      ['band', 'ban nhạc', '🎸', 'I am in a band.', 'Mình ở trong một ban nhạc.'],
      ['hand', 'bàn tay', '🖐️', 'Use your hand.', 'Hãy dùng bàn tay của bạn.'],
      ['music', 'âm nhạc', '🎵', 'I love music.', 'Mình yêu âm nhạc.'],
    ],
    reading: {
      title: 'The Little Drummer',
      text: ['Mia has a red drum.', 'She holds two sticks.', 'Boom, boom, boom! The drum is loud.', 'Her band loves the music.'],
      vi: 'Mia có một chiếc trống đỏ. Bạn ấy cầm hai chiếc dùi. Boom, boom, boom! Tiếng trống rất to. Ban nhạc của bạn ấy yêu bản nhạc.',
      qs: [
        { q: 'What color is the drum?', o: ['Blue', 'Red', 'Green'], a: 1 },
        { q: 'How many sticks does Mia hold?', o: ['Two', 'One', 'Five'], a: 0 },
        { q: 'How is the drum?', o: ['Soft', 'Broken', 'Loud'], a: 2 },
      ],
    },
  },
  {
    id: 'piano', name: 'Chơi piano', emoji: '🎹', color: '#ff9f0a',
    words: [
      ['piano', 'đàn piano', '🎹', 'I play the piano.', 'Mình chơi đàn piano.'],
      ['key', 'phím đàn', '🔑', 'Press the white key.', 'Hãy nhấn phím trắng.'],
      ['song', 'bài hát', '🎶', 'This is a happy song.', 'Đây là bài hát vui.'],
      ['finger', 'ngón tay', '☝️', 'Use your finger.', 'Hãy dùng ngón tay của bạn.'],
      ['sing', 'hát', '🎤', 'I sing and play.', 'Mình vừa hát vừa chơi.'],
      ['listen', 'lắng nghe', '👂', 'Listen to the sound.', 'Hãy lắng nghe âm thanh.'],
      ['note', 'nốt nhạc', '🎼', 'This note is high.', 'Nốt này cao.'],
      ['practice', 'luyện tập', '🔁', 'I practice every day.', 'Mình luyện tập mỗi ngày.'],
    ],
    reading: {
      title: 'Piano Time',
      text: ['Ben has a piano.', 'He practices every day.', 'He presses the keys with his fingers.', 'Now he can play a happy song.'],
      vi: 'Ben có một cây đàn piano. Bạn ấy luyện tập mỗi ngày. Bạn ấy nhấn phím bằng các ngón tay. Giờ bạn ấy có thể chơi một bài hát vui.',
      qs: [
        { q: 'When does Ben practice?', o: ['Never', 'Every day', 'On Sunday only'], a: 1 },
        { q: 'What does Ben use to press the keys?', o: ['Fingers', 'Shoes', 'Sticks'], a: 0 },
        { q: 'What song can he play?', o: ['A sad song', 'A scary song', 'A happy song'], a: 2 },
      ],
    },
  },
  {
    id: 'daily', name: 'Cuộc sống hằng ngày', emoji: '🏠', color: '#ff375f',
    words: [
      ['breakfast', 'bữa sáng', '🍳', 'I eat breakfast at seven.', 'Mình ăn sáng lúc bảy giờ.'],
      ['school', 'trường học', '🏫', 'I go to school.', 'Mình đi học.'],
      ['bus', 'xe buýt', '🚌', 'I take the bus.', 'Mình đi xe buýt.'],
      ['mom', 'mẹ', '👩', 'My mom is kind.', 'Mẹ mình rất tốt bụng.'],
      ['bed', 'cái giường', '🛏️', 'I go to bed at nine.', 'Mình đi ngủ lúc chín giờ.'],
      ['shower', 'tắm vòi sen', '🚿', 'I take a shower.', 'Mình đi tắm.'],
      ['book', 'quyển sách', '📖', 'I read a book.', 'Mình đọc một quyển sách.'],
      ['dinner', 'bữa tối', '🍽️', 'We eat dinner together.', 'Cả nhà ăn tối cùng nhau.'],
    ],
    reading: {
      title: 'My Day',
      text: ['I eat breakfast with my mom.', 'Then I take the bus to school.', 'At night, we eat dinner.', 'I read a book and go to bed.'],
      vi: 'Mình ăn sáng với mẹ. Sau đó mình đi xe buýt đến trường. Buổi tối cả nhà ăn tối. Mình đọc sách rồi đi ngủ.',
      qs: [
        { q: 'Who eats breakfast with me?', o: ['My mom', 'My teacher', 'My dog'], a: 0 },
        { q: 'How do I go to school?', o: ['By boat', 'By bus', 'By bed'], a: 1 },
        { q: 'What do I do before bed?', o: ['Play drums', 'Catch fish', 'Read a book'], a: 2 },
      ],
    },
  },
  {
    id: 'tiktok', name: 'TikTok', emoji: '📱', color: '#00c7be',
    words: [
      ['video', 'video', '🎬', 'I make a video.', 'Mình làm một video.'],
      ['phone', 'điện thoại', '📱', 'My phone is new.', 'Điện thoại của mình mới.'],
      ['like', 'thích, lượt thích', '👍', 'I like this video.', 'Mình thích video này.'],
      ['share', 'chia sẻ', '🔗', 'Share it with friends.', 'Hãy chia sẻ với bạn bè.'],
      ['dance', 'nhảy múa', '💃', 'We dance together.', 'Chúng mình nhảy cùng nhau.'],
      ['funny', 'hài hước', '😂', 'This video is funny.', 'Video này hài hước.'],
      ['follow', 'theo dõi', '➕', 'I follow my friend.', 'Mình theo dõi bạn của mình.'],
      ['camera', 'máy quay, máy ảnh', '📷', 'Turn on the camera.', 'Hãy bật máy quay lên.'],
    ],
    reading: {
      title: 'A Fun Video',
      text: ['Lily has a phone.', 'She makes a funny dance video.', 'Her friends like it and share it.', 'Now she has many followers!'],
      vi: 'Lily có một chiếc điện thoại. Bạn ấy làm một video nhảy hài hước. Bạn bè thích và chia sẻ nó. Giờ bạn ấy có nhiều người theo dõi!',
      qs: [
        { q: 'What does Lily make?', o: ['A cake', 'A dance video', 'A drum'], a: 1 },
        { q: 'What do her friends do?', o: ['Like and share it', 'Delete it', 'Sleep'], a: 0 },
        { q: 'At the end, Lily has…', o: ['No phone', 'A ball', 'Many followers'], a: 2 },
      ],
    },
  },
];

// Gán id cho từng từ & chuyển thành object.
TOPICS.forEach((t) => {
  t.words = t.words.map((w) => ({
    id: t.id + ':' + w[0], topic: t.id, en: w[0], vi: w[1], emoji: w[2], ex: w[3], exVi: w[4],
  }));
});
const ALL_WORDS = TOPICS.flatMap((t) => t.words);

const STEPS = [
  { key: 'learn', name: 'Học từ mới', emoji: '📚', desc: 'Xem hình, nghe và nhớ từ' },
  { key: 'listen', name: 'Luyện nghe', emoji: '👂', desc: 'Nghe và chọn hình đúng' },
  { key: 'speak', name: 'Luyện phát âm', emoji: '🎤', desc: 'Nghe rồi nói theo' },
  { key: 'read', name: 'Đọc hiểu', emoji: '📖', desc: 'Đọc truyện ngắn, trả lời câu hỏi' },
  { key: 'test', name: 'Bài kiểm tra', emoji: '🏆', desc: 'Thử thách tổng hợp' },
];

const AVATARS = [
  { e: '🐶', cost: 0 }, { e: '🐱', cost: 0 }, { e: '🐼', cost: 50 }, { e: '🦊', cost: 80 },
  { e: '🐯', cost: 120 }, { e: '🦁', cost: 160 }, { e: '🐵', cost: 200 }, { e: '🦄', cost: 300 },
  { e: '🐲', cost: 400 }, { e: '🚀', cost: 500 },
];

const BADGES = [
  { id: 'first', e: '🌱', name: 'Bước đầu tiên', desc: 'Hoàn thành bài tập đầu tiên' },
  { id: 'streak3', e: '🔥', name: 'Chuỗi 3 ngày', desc: 'Học 3 ngày liên tiếp' },
  { id: 'streak7', e: '⚡', name: 'Chuỗi 7 ngày', desc: 'Học 7 ngày liên tiếp' },
  { id: 'points100', e: '💎', name: '100 điểm', desc: 'Đạt 100 điểm' },
  { id: 'points500', e: '👑', name: '500 điểm', desc: 'Đạt 500 điểm' },
  { id: 'stars10', e: '⭐', name: '10 ngôi sao', desc: 'Thu thập 10 ngôi sao' },
  { id: 'speaker', e: '🗣️', name: 'Giọng đọc hay', desc: 'Phát âm đúng 10 từ' },
  { id: 'master', e: '🏅', name: 'Bậc thầy chủ đề', desc: 'Hoàn thành cả 5 bước của một chủ đề' },
  { id: 'saver', e: '💾', name: 'Nhà sưu tầm', desc: 'Lưu 5 từ yêu thích' },
];
