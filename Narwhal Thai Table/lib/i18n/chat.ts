import { deepMerge } from './merge';
import type { Locale } from './locales';

/**
 * Aileen's chat widget (components/ChatWidget.tsx) — greetings and the small
 * UI strings around them, per edition. Client-safe and deliberately small: the
 * widget ships in every page's bundle.
 *
 * 16 Oct 2026: until now Aileen opened in English on every edition (the
 * owner's language audit flagged it). The host still answers in whatever
 * language the guest writes — this only sets the opening line and the chrome,
 * and app/api/chat/route.ts is told which edition the guest came from.
 *
 * `{seat}` in `table` is filled from `seat` (table / patio / fallback); `{n}`
 * is the table number; `{brand}` in `rewards` is rendered bold.
 */
const en = {
  greetings: [
    "Hi, I'm Aileen — your host at Narwhal Thai Table. 🌿 Ask me about the menu, what to order, our hours, or book a table. What are you in the mood for?",
    "Sawasdee ka! 🙏 I'm Aileen, the host here at Narwhal Thai Table. Curious about a dish, our hours, or want me to save you a seat?",
    "Hey there — I'm Aileen, your Narwhal Thai Table host. 🐳 I can help you pick a dish, plan a visit, or book a table. Where shall we start?",
    "Welcome in! I'm Aileen. Want a recommendation from our menu, our hours, or a table booked? Just say the word. 🌿",
    "So glad you stopped by — Aileen here, hosting at Narwhal Thai Table. Hungry for ideas, checking hours, or booking a table?",
    "Hi! Aileen, your host at Narwhal Thai Table. 🐳 Ask me anything about the menu or your visit — I can even pass a note to the team for you.",
  ],
  closed:
    "Sawasdee ka! 🌙 We're closed at the moment, but I'm still here — happy to help with menu questions, booking a table, or leaving a note for the team. What can I do for you?",
  togo:
    "Sawasdee ka! 🥡 I'm Aileen — ordering to-go today? Browse the menu right up there and tell me what you'd like. I'll just need a name for the order, and you pay at the counter when it's in!",
  table:
    "Sawasdee ka — welcome to {seat}! 🐳 I'm Aileen, your host. Browse the menu just up there and I'll help you pick. When you're ready to order — or need anything at all — just tell me and I'll send a server right over. What are you in the mood for?",
  seat: { table: 'table {n}', patio: 'patio table {n}', yours: 'your table' },
  fabOpen: 'Chat with Aileen, our host',
  fabClose: 'Close chat',
  dialog: 'Chat with Narwhal Thai Table',
  headSub: 'Narwhal Thai Table · host',
  minimize: 'Minimize chat to browse the menu',
  expand: 'Expand chat to full screen',
  typing: 'Aileen is typing',
  placeholder: 'Ask about the menu, hours, booking…',
  inputLabel: 'Type your message',
  send: 'Send message',
  foot: 'Aileen is an AI host — details may vary; the team confirms by email.',
  errNoReply: "Sorry, I didn't catch that.",
  errConnect: "Sorry — I couldn't connect. Please try again in a moment.",
  rewards: 'Earn {brand} points on this meal',
};

export type ChatDict = typeof en;

const th: ChatDict = {
  greetings: [
    'สวัสดีค่ะ ยินดีต้อนรับสู่ Narwhal Thai Table ดิฉัน Aileen ผู้ช่วยดูแลคุณประจำร้าน สอบถามเมนูแนะนำ ระดับความเผ็ด เวลาทำการ หรือสำรองที่นั่งได้เลยค่ะ',
    'สวัสดีค่ะ 🙏 Aileen เองค่ะ โฮสต์ของ Narwhal Thai Table อยากให้ช่วยแนะนำเมนู เช็กเวลาเปิด หรือจองโต๊ะไว้ก่อนไหมคะ บอกได้เลยค่ะ',
  ],
  closed:
    'สวัสดีค่ะ 🌙 ตอนนี้ร้านปิดอยู่ แต่ Aileen ยังอยู่ตรงนี้นะคะ — ถามเรื่องเมนู จองโต๊ะ หรือฝากข้อความถึงทีมงานได้เลยค่ะ ให้ช่วยอะไรดีคะ',
  togo:
    'สวัสดีค่ะ 🥡 Aileen ค่ะ — วันนี้สั่งกลับบ้านใช่ไหมคะ เลือกดูเมนูด้านบนแล้วบอกได้เลยค่ะว่าอยากได้อะไร ขอแค่ชื่อสำหรับออเดอร์ แล้วชำระเงินที่เคาน์เตอร์เมื่อออเดอร์เข้าครัวแล้วค่ะ',
  table:
    'สวัสดีค่ะ — ยินดีต้อนรับสู่{seat}ค่ะ 🐳 Aileen โฮสต์ของร้านค่ะ เลือกดูเมนูด้านบนได้เลย เดี๋ยวช่วยแนะนำนะคะ พร้อมสั่งเมื่อไหร่ — หรือต้องการอะไรก็ตาม — บอก Aileen แล้วจะส่งพนักงานไปที่โต๊ะทันทีค่ะ วันนี้อยากทานอะไรดีคะ',
  seat: { table: 'โต๊ะ {n}', patio: 'โต๊ะระเบียง {n}', yours: 'โต๊ะของคุณ' },
  fabOpen: 'แชทกับ Aileen โฮสต์ของเรา',
  fabClose: 'ปิดแชท',
  dialog: 'แชทกับ Narwhal Thai Table',
  headSub: 'Narwhal Thai Table · โฮสต์',
  minimize: 'ย่อแชทเพื่อดูเมนู',
  expand: 'ขยายแชทเต็มจอ',
  typing: 'Aileen กำลังพิมพ์',
  placeholder: 'ถามเรื่องเมนู เวลาเปิด การจอง…',
  inputLabel: 'พิมพ์ข้อความของคุณ',
  send: 'ส่งข้อความ',
  foot: 'Aileen เป็นโฮสต์ AI — รายละเอียดอาจคลาดเคลื่อน ทีมงานจะยืนยันทางอีเมล',
  errNoReply: 'ขอโทษค่ะ ไม่เข้าใจข้อความนี้ ลองพิมพ์ใหม่อีกครั้งนะคะ',
  errConnect: 'ขอโทษค่ะ — เชื่อมต่อไม่ได้ กรุณาลองใหม่อีกสักครู่นะคะ',
  rewards: 'รับคะแนน {brand} จากมื้อนี้',
};

const vi: ChatDict = {
  greetings: [
    'Xin chào quý khách đến với Narwhal Thai Table! Tôi là Aileen — trợ lý đón tiếp của nhà hàng. Quý khách cần gợi ý món ngon, độ cay, giờ mở cửa hay đặt bàn trước, hãy nhắn cho tôi nhé.',
    'Sawasdee ka! 🙏 Aileen đây — người đón tiếp của Narwhal Thai Table. Quý khách muốn hỏi về một món, giờ mở cửa, hay để tôi giữ chỗ trước?',
  ],
  closed:
    'Sawasdee ka! 🌙 Nhà hàng hiện đang đóng cửa, nhưng tôi vẫn ở đây — sẵn sàng trả lời về thực đơn, nhận đặt bàn hoặc chuyển lời nhắn đến đội ngũ. Tôi có thể giúp gì cho quý khách?',
  togo:
    'Sawasdee ka! 🥡 Tôi là Aileen — hôm nay quý khách đặt món mang về phải không? Xem thực đơn ngay phía trên và cho tôi biết quý khách muốn dùng gì. Tôi chỉ cần tên để ghi đơn, và quý khách thanh toán tại quầy khi đơn đã vào bếp!',
  table:
    'Sawasdee ka — chào mừng quý khách đến {seat}! 🐳 Tôi là Aileen, người đón tiếp của nhà hàng. Xem thực đơn ngay phía trên, tôi sẽ giúp quý khách chọn món. Khi sẵn sàng gọi món — hoặc cần bất cứ điều gì — chỉ cần nhắn tôi, tôi sẽ mời nhân viên đến bàn ngay. Hôm nay quý khách muốn dùng gì?',
  seat: { table: 'bàn {n}', patio: 'bàn sân hiên {n}', yours: 'bàn của quý khách' },
  fabOpen: 'Trò chuyện với Aileen, người đón tiếp của chúng tôi',
  fabClose: 'Đóng cửa sổ trò chuyện',
  dialog: 'Trò chuyện với Narwhal Thai Table',
  headSub: 'Narwhal Thai Table · đón tiếp',
  minimize: 'Thu nhỏ để xem thực đơn',
  expand: 'Mở rộng toàn màn hình',
  typing: 'Aileen đang nhập',
  placeholder: 'Hỏi về thực đơn, giờ mở cửa, đặt bàn…',
  inputLabel: 'Nhập tin nhắn của bạn',
  send: 'Gửi tin nhắn',
  foot: 'Aileen là người đón tiếp AI — chi tiết có thể thay đổi; đội ngũ sẽ xác nhận qua email.',
  errNoReply: 'Xin lỗi, tôi chưa hiểu ý quý khách.',
  errConnect: 'Xin lỗi — không kết nối được. Vui lòng thử lại sau giây lát.',
  rewards: 'Tích điểm {brand} cho bữa ăn này',
};

const zh: ChatDict = {
  greetings: [
    '您好，欢迎光临 Narwhal Thai Table！我是您的线上接待员 Aileen。无论您想了解招牌菜推荐、辣度选择、营业时间还是预订座位，随时都可以问我。',
    '萨瓦迪卡！🙏 我是 Aileen，Narwhal Thai Table 的接待员。想了解某道菜、营业时间，或者先为您留个座位？',
  ],
  closed:
    '萨瓦迪卡！🌙 餐厅此刻已打烊，不过我还在这里 — 菜单问题、预订座位或给团队留言，都可以交给我。需要什么帮助？',
  togo:
    '萨瓦迪卡！🥡 我是 Aileen — 今天是外带吗？请浏览上方菜单，告诉我您想要什么。我只需要一个取餐姓名，订单进厨房后您在柜台付款即可！',
  table:
    '萨瓦迪卡 — 欢迎来到{seat}！🐳 我是接待员 Aileen。请浏览上方菜单，我来帮您挑选。准备点餐时 — 或有任何需要 — 告诉我，我马上请服务员到您桌边。今天想吃点什么？',
  seat: { table: '{n} 号桌', patio: '露台 {n} 号桌', yours: '您的餐桌' },
  fabOpen: '与我们的接待员 Aileen 聊天',
  fabClose: '关闭聊天',
  dialog: '与 Narwhal Thai Table 聊天',
  headSub: 'Narwhal Thai Table · 接待员',
  minimize: '缩小聊天窗口以浏览菜单',
  expand: '展开聊天至全屏',
  typing: 'Aileen 正在输入',
  placeholder: '询问菜单、营业时间、订位…',
  inputLabel: '输入您的消息',
  send: '发送消息',
  foot: 'Aileen 是 AI 接待员 — 细节可能有出入，以团队的邮件确认为准。',
  errNoReply: '抱歉，我没听明白。',
  errConnect: '抱歉 — 连接失败，请稍后再试。',
  rewards: '本餐可累积 {brand} 积分',
};

const zhTw: ChatDict = {
  greetings: [
    '您好，歡迎光臨 Narwhal Thai Table！我是您的線上接待員 Aileen。無論您想了解招牌菜推薦、辣度選擇、營業時間或是預訂座位，隨時都可以問我。',
    '薩瓦迪卡！🙏 我是 Aileen，Narwhal Thai Table 的接待員。想了解某道菜、營業時間，或先為您留個座位？',
  ],
  closed:
    '薩瓦迪卡！🌙 餐廳此刻已打烊，不過我還在這裡 — 菜單問題、預訂座位或留言給團隊，都可以交給我。需要什麼幫忙？',
  togo:
    '薩瓦迪卡！🥡 我是 Aileen — 今天是外帶嗎？請瀏覽上方菜單，告訴我您想要什麼。我只需要一個取餐姓名，訂單進廚房後您在櫃檯付款即可！',
  table:
    '薩瓦迪卡 — 歡迎來到{seat}！🐳 我是接待員 Aileen。請瀏覽上方菜單，我來幫您挑選。準備點餐時 — 或有任何需要 — 告訴我，我馬上請服務人員到您桌邊。今天想吃點什麼？',
  seat: { table: '{n} 號桌', patio: '露台 {n} 號桌', yours: '您的餐桌' },
  fabOpen: '與我們的接待員 Aileen 聊天',
  fabClose: '關閉聊天',
  dialog: '與 Narwhal Thai Table 聊天',
  headSub: 'Narwhal Thai Table · 接待員',
  minimize: '縮小聊天視窗以瀏覽菜單',
  expand: '展開聊天至全螢幕',
  typing: 'Aileen 正在輸入',
  placeholder: '詢問菜單、營業時間、訂位…',
  inputLabel: '輸入您的訊息',
  send: '送出訊息',
  foot: 'Aileen 是 AI 接待員 — 細節可能有出入，以團隊的電子郵件確認為準。',
  errNoReply: '抱歉，我沒聽明白。',
  errConnect: '抱歉 — 連線失敗，請稍後再試。',
  rewards: '本餐可累積 {brand} 點數',
};

const ko: ChatDict = {
  greetings: [
    'Narwhal Thai Table에 오신 것을 환영합니다! 저는 AI 호스트 Aileen입니다. 메뉴 추천이나 맵기 조절, 영업시간, 테이블 예약 등 궁금하신 점을 편하게 물어보세요.',
    '사왓디 카! 🙏 Narwhal Thai Table의 호스트 Aileen입니다. 궁금한 메뉴가 있으신가요, 영업시간이 궁금하신가요, 아니면 자리를 미리 잡아 드릴까요?',
  ],
  closed:
    '사왓디 카! 🌙 지금은 영업시간이 아니지만 저는 여기 있습니다 — 메뉴 문의, 테이블 예약, 팀에 전할 메시지 모두 도와드릴게요. 무엇을 도와드릴까요?',
  togo:
    '사왓디 카! 🥡 Aileen입니다 — 오늘은 포장이신가요? 바로 위 메뉴를 둘러보시고 원하시는 것을 말씀해 주세요. 주문에 넣을 이름만 알려 주시면 되고, 주문이 들어가면 카운터에서 결제하시면 됩니다!',
  table:
    '사왓디 카 — {seat}에 오신 것을 환영합니다! 🐳 호스트 Aileen입니다. 바로 위 메뉴를 둘러보시면 고르시는 걸 도와드릴게요. 주문하실 준비가 되시면 — 또는 무엇이든 필요하시면 — 말씀만 하세요, 바로 직원을 보내 드리겠습니다. 오늘은 어떤 음식이 당기시나요?',
  seat: { table: '{n}번 테이블', patio: '파티오 {n}번 테이블', yours: '고객님 테이블' },
  fabOpen: '호스트 Aileen과 채팅하기',
  fabClose: '채팅 닫기',
  dialog: 'Narwhal Thai Table과 채팅',
  headSub: 'Narwhal Thai Table · 호스트',
  minimize: '채팅을 줄이고 메뉴 보기',
  expand: '채팅 전체 화면으로 펼치기',
  typing: 'Aileen이 입력 중',
  placeholder: '메뉴, 영업시간, 예약 문의…',
  inputLabel: '메시지를 입력하세요',
  send: '메시지 보내기',
  foot: 'Aileen은 AI 호스트입니다 — 세부 내용은 다를 수 있으며, 팀이 이메일로 확인해 드립니다.',
  errNoReply: '죄송해요, 잘 이해하지 못했어요.',
  errConnect: '죄송해요 — 연결되지 않았어요. 잠시 후 다시 시도해 주세요.',
  rewards: '이번 식사로 {brand} 포인트 적립하기',
};

const ja: ChatDict = {
  greetings: [
    'Narwhal Thai Table へようこそ。私は AI ホストの Aileen です。おすすめのお料理や辛さの調整、営業時間、お席のご予約など、どうぞお気軽にお尋ねください。',
    'サワッディー・カー！🙏 Narwhal Thai Table のホスト、Aileen です。気になるお料理や営業時間のこと、お席の確保など、何でもお申し付けください。',
  ],
  closed:
    'サワッディー・カー！🌙 ただいま営業時間外ですが、私はここにいます — メニューのご質問、お席のご予約、スタッフへの伝言など、お気軽にどうぞ。何かお手伝いできることはありますか？',
  togo:
    'サワッディー・カー！🥡 Aileen です — 本日はお持ち帰りですか？すぐ上のメニューをご覧になって、ご希望をお聞かせください。ご注文用のお名前だけ伺います。お会計は、ご注文が通ったあとカウンターでお願いします！',
  table:
    'サワッディー・カー — {seat}へようこそ！🐳 ホストの Aileen です。すぐ上のメニューをご覧ください。お選びのお手伝いをします。ご注文の準備ができたら — ほかに何かご入り用のときも — お知らせいただければ、すぐにスタッフをお席へお呼びします。今日はどんな気分ですか？',
  seat: { table: '{n} 番テーブル', patio: 'パティオ {n} 番テーブル', yours: 'お客様のテーブル' },
  fabOpen: 'ホストの Aileen とチャット',
  fabClose: 'チャットを閉じる',
  dialog: 'Narwhal Thai Table とチャット',
  headSub: 'Narwhal Thai Table · ホスト',
  minimize: 'チャットを小さくしてメニューを見る',
  expand: 'チャットを全画面に広げる',
  typing: 'Aileen が入力中',
  placeholder: 'メニュー、営業時間、ご予約について…',
  inputLabel: 'メッセージを入力',
  send: 'メッセージを送信',
  foot: 'Aileen は AI ホストです — 内容が異なる場合があります。最終確認はスタッフがメールでご連絡します。',
  errNoReply: 'すみません、うまく聞き取れませんでした。',
  errConnect: 'すみません — 接続できませんでした。少し経ってからもう一度お試しください。',
  rewards: 'このお食事で {brand} のポイントを貯める',
};

const es: ChatDict = {
  greetings: [
    '¡Bienvenido a Narwhal Thai Table! Soy Aileen, tu anfitriona virtual. Pregúntame por recomendaciones del menú, niveles de picante, horarios o reservaciones de mesa.',
    '¡Sawasdee ka! 🙏 Soy Aileen, la anfitriona de Narwhal Thai Table. ¿Tienes curiosidad por algún platillo, quieres saber el horario o que te aparte una mesa?',
  ],
  closed:
    '¡Sawasdee ka! 🌙 Ahora mismo estamos cerrados, pero aquí sigo — con gusto te ayudo con dudas del menú, una reservación o un mensaje para el equipo. ¿En qué te ayudo?',
  togo:
    '¡Sawasdee ka! 🥡 Soy Aileen — ¿hoy es para llevar? Mira el menú aquí arriba y dime qué se te antoja. Solo necesito un nombre para la orden, y pagas en el mostrador cuando ya esté en cocina.',
  table:
    'Sawasdee ka — ¡bienvenido a {seat}! 🐳 Soy Aileen, tu anfitriona. Mira el menú aquí arriba y te ayudo a escoger. Cuando estés listo para ordenar — o necesites cualquier cosa — dímelo y mando a un mesero enseguida. ¿Qué se te antoja hoy?',
  seat: { table: 'la mesa {n}', patio: 'la mesa {n} del patio', yours: 'tu mesa' },
  fabOpen: 'Chatea con Aileen, nuestra anfitriona',
  fabClose: 'Cerrar el chat',
  dialog: 'Chat con Narwhal Thai Table',
  headSub: 'Narwhal Thai Table · anfitriona',
  minimize: 'Minimizar el chat para ver el menú',
  expand: 'Expandir el chat a pantalla completa',
  typing: 'Aileen está escribiendo',
  placeholder: 'Pregunta por el menú, horario, reservaciones…',
  inputLabel: 'Escribe tu mensaje',
  send: 'Enviar mensaje',
  foot: 'Aileen es una anfitriona de IA — los detalles pueden variar; el equipo confirma por correo.',
  errNoReply: 'Perdón, no entendí eso.',
  errConnect: 'Perdón — no pude conectarme. Inténtalo de nuevo en un momento.',
  rewards: 'Gana puntos {brand} con esta comida',
};

const DICTS: Record<Locale, ChatDict> = {
  en,
  th: deepMerge(en, th),
  vi: deepMerge(en, vi),
  zh: deepMerge(en, zh),
  'zh-tw': deepMerge(en, zhTw),
  ko: deepMerge(en, ko),
  ja: deepMerge(en, ja),
  es: deepMerge(en, es),
};

export function chat(locale: Locale): ChatDict {
  return DICTS[locale] ?? en;
}

/** "7" → table 7, "P3" → patio table 3, anything else → "your table" — in the edition's words. */
export function seatLabel(t: string, d: ChatDict): string {
  if (/^\d+$/.test(t)) return d.seat.table.replace('{n}', t);
  const patio = t.match(/^p-?(\d+)$/i);
  if (patio) return d.seat.patio.replace('{n}', patio[1]);
  return d.seat.yours;
}
