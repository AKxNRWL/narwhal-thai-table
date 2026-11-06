import type { Locale } from './locales';

/**
 * /accessibility — the accessibility statement, in every edition (6 Nov 2026).
 *
 * Why it exists: ADA Title III + California's Unruh Act. A public statement
 * that names the standard (WCAG 2.1 AA), lists what the site does, admits
 * what third parties control, and gives a phone number and an email for
 * help is what every accessibility lawyer asks a restaurant to publish —
 * and it is simply the honest thing to tell a guest who needs it.
 *
 * Copy rules: nothing claimed that is not true of the site (checked by
 * scripts/a11y-sweep.mjs); no physical-premises claims (parking, restrooms)
 * beyond "call ahead" — those are the owner's to state.
 */
export type A11yStatement = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lede: string;
  standardH: string;
  standard: string;
  featuresH: string;
  features: string[];
  prefsH: string;
  prefsLede: string;
  thirdH: string;
  third: string;
  feedbackH: string;
  feedback: string;
  call: string;
  email: string;
  diningH: string;
  dining: string;
  updated: string;
};

const en: A11yStatement = {
  metaTitle: 'Accessibility · Narwhal Thai Table',
  metaDescription:
    'Narwhal Thai Table’s accessibility statement: WCAG 2.1 AA, keyboard and screen-reader support, pause controls, text sizing, and how to reach us if anything is hard to use.',
  title: 'Accessibility at Narwhal Thai Table',
  lede:
    'Everyone should be able to read our menu, save a seat and reach us — whether you use a screen reader, a keyboard, voice control, magnification, or simply prefer a calmer page.',
  standardH: 'Our standard',
  standard:
    'We build and test this website against the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, and we keep up with 2.2. Every page is checked with automated tools and by hand with a keyboard and a screen reader, and we check again whenever we add something new.',
  featuresH: 'What is built in',
  features: [
    'Everything works with a keyboard alone, with a clear focus ring and a “Skip to content” link on every page.',
    'Images, buttons and links have names a screen reader can speak; Thai and other foreign dish names are tagged with their language so they are pronounced properly.',
    'Text can be enlarged to 200% and every page reflows at phone width without sideways scrolling.',
    'Anything that moves — the hours ticker, photo strips, background video — can be paused, and the site follows your device’s reduce-motion and high-contrast settings on its own.',
    'Forms have visible labels, clear error messages and no time limits.',
    'Colors are checked for contrast, and nothing flashes.',
  ],
  prefsH: 'Set the page up your way',
  prefsLede: 'The same switches sit one tap away in the menu bar of every page. Your choices stay on this device.',
  thirdH: 'Things we don’t control',
  third:
    'Online ordering runs on Toast, the map is from Google, and the films on The Entertainment page are hosted by YouTube, Instagram and TikTok. We chose partners who publish their own accessibility commitments — but if any of them gives you trouble, call us and we will happily take your order or reservation by phone.',
  feedbackH: 'Tell us if something is hard to use',
  feedback:
    'If any part of this website is difficult for you, please let us know and we will fix it or help you another way. We read every message.',
  call: 'Call',
  email: 'Email',
  diningH: 'In the restaurant',
  dining: 'Questions about the dining room, parking or seating for your needs? Call ahead and we will make it work.',
  updated: 'Last reviewed: November 2026',
};

const th: A11yStatement = {
  metaTitle: 'การเข้าถึง · Narwhal Thai Table',
  metaDescription:
    'ประกาศด้านการเข้าถึงของ Narwhal Thai Table: มาตรฐาน WCAG 2.1 AA รองรับคีย์บอร์ดและโปรแกรมอ่านหน้าจอ ปุ่มหยุดภาพเคลื่อนไหว การขยายตัวหนังสือ และช่องทางติดต่อเราเมื่อใช้งานไม่สะดวก',
  title: 'การเข้าถึงที่ Narwhal Thai Table',
  lede:
    'ทุกคนควรอ่านเมนู จองโต๊ะ และติดต่อเราได้ — ไม่ว่าจะใช้โปรแกรมอ่านหน้าจอ คีย์บอร์ด การสั่งงานด้วยเสียง แว่นขยาย หรือเพียงอยากได้หน้าเว็บที่นิ่งสบายตา',
  standardH: 'มาตรฐานของเรา',
  standard:
    'เราสร้างและทดสอบเว็บไซต์นี้ตามแนวทาง Web Content Accessibility Guidelines (WCAG) 2.1 ระดับ AA และตามให้ทันเวอร์ชัน 2.2 ทุกหน้าผ่านการตรวจด้วยเครื่องมืออัตโนมัติและตรวจด้วยมือผ่านคีย์บอร์ดและโปรแกรมอ่านหน้าจอ และจะตรวจซ้ำทุกครั้งที่เพิ่มสิ่งใหม่',
  featuresH: 'สิ่งที่มีให้ในเว็บ',
  features: [
    'ใช้งานได้ครบด้วยคีย์บอร์ดอย่างเดียว มีกรอบโฟกัสชัดเจน และลิงก์ “ข้ามไปเนื้อหา” ทุกหน้า',
    'รูปภาพ ปุ่ม และลิงก์มีชื่อที่โปรแกรมอ่านหน้าจออ่านออกเสียงได้ ชื่ออาหารภาษาไทยและภาษาอื่นระบุภาษาไว้เพื่อให้ออกเสียงถูกต้อง',
    'ขยายตัวหนังสือได้ถึง 200% และทุกหน้าจัดวางใหม่ให้พอดีจอมือถือโดยไม่ต้องเลื่อนไปด้านข้าง',
    'ทุกอย่างที่เคลื่อนไหว — แถบเวลาเปิด แถบรูปเลื่อน วิดีโอพื้นหลัง — หยุดได้ และเว็บทำตามค่าลดการเคลื่อนไหวและความคมชัดสูงของอุปกรณ์คุณโดยอัตโนมัติ',
    'แบบฟอร์มมีป้ายกำกับชัดเจน ข้อความแจ้งข้อผิดพลาดเข้าใจง่าย และไม่มีการจำกัดเวลา',
    'สีผ่านการตรวจความคมชัด และไม่มีอะไรกะพริบ',
  ],
  prefsH: 'ตั้งค่าหน้าเว็บในแบบของคุณ',
  prefsLede: 'สวิตช์ชุดเดียวกันนี้อยู่ที่แถบเมนูของทุกหน้า แตะเดียวถึง การตั้งค่าจะจำไว้ในอุปกรณ์นี้',
  thirdH: 'สิ่งที่อยู่นอกการควบคุมของเรา',
  third:
    'ระบบสั่งอาหารออนไลน์ทำงานบน Toast แผนที่มาจาก Google และวิดีโอในหน้า The Entertainment โฮสต์โดย YouTube, Instagram และ TikTok เราเลือกพาร์ตเนอร์ที่มีนโยบายการเข้าถึงของตัวเอง — แต่ถ้าบริการใดใช้ไม่สะดวก โทรหาเราได้เลย เรายินดีรับออเดอร์หรือรับจองทางโทรศัพท์',
  feedbackH: 'บอกเราถ้ามีอะไรใช้ยาก',
  feedback:
    'ถ้าส่วนใดของเว็บไซต์นี้ใช้งานลำบาก กรุณาแจ้งให้เราทราบ เราจะแก้ไขหรือช่วยเหลือด้วยวิธีอื่น เราอ่านทุกข้อความ',
  call: 'โทร',
  email: 'อีเมล',
  diningH: 'ที่ร้าน',
  dining: 'มีคำถามเรื่องห้องอาหาร ที่จอดรถ หรือที่นั่งที่เหมาะกับความต้องการของคุณ โทรมาล่วงหน้าได้เลย เราจะจัดให้',
  updated: 'ตรวจสอบล่าสุด: พฤศจิกายน 2026',
};

const vi: A11yStatement = {
  metaTitle: 'Trợ năng · Narwhal Thai Table',
  metaDescription:
    'Tuyên bố về trợ năng của Narwhal Thai Table: chuẩn WCAG 2.1 AA, hỗ trợ bàn phím và trình đọc màn hình, nút tạm dừng chuyển động, phóng to chữ, và cách liên hệ khi có gì khó dùng.',
  title: 'Trợ năng tại Narwhal Thai Table',
  lede:
    'Ai cũng nên đọc được thực đơn, đặt bàn và liên hệ với chúng tôi — dù bạn dùng trình đọc màn hình, bàn phím, điều khiển bằng giọng nói, phóng to, hay chỉ muốn một trang web yên tĩnh hơn.',
  standardH: 'Tiêu chuẩn của chúng tôi',
  standard:
    'Chúng tôi xây dựng và kiểm tra trang web này theo Hướng dẫn Trợ năng Nội dung Web (WCAG) 2.1 mức AA và theo sát phiên bản 2.2. Mỗi trang được kiểm tra bằng công cụ tự động và thủ công với bàn phím và trình đọc màn hình, và được kiểm tra lại mỗi khi có nội dung mới.',
  featuresH: 'Những gì đã có sẵn',
  features: [
    'Mọi thứ dùng được chỉ với bàn phím, có khung tiêu điểm rõ ràng và liên kết “Đến nội dung chính” trên mọi trang.',
    'Hình ảnh, nút và liên kết đều có tên để trình đọc màn hình đọc được; tên món tiếng Thái và tiếng khác được gắn ngôn ngữ để phát âm đúng.',
    'Chữ có thể phóng to tới 200% và mọi trang tự sắp xếp lại vừa màn hình điện thoại mà không phải cuộn ngang.',
    'Mọi thứ chuyển động — dải giờ mở cửa, dải ảnh, video nền — đều tạm dừng được, và trang web tự theo cài đặt giảm chuyển động và tương phản cao trên thiết bị của bạn.',
    'Biểu mẫu có nhãn rõ ràng, thông báo lỗi dễ hiểu và không giới hạn thời gian.',
    'Màu sắc được kiểm tra độ tương phản, và không có gì nhấp nháy.',
  ],
  prefsH: 'Chỉnh trang theo cách của bạn',
  prefsLede: 'Các công tắc này cũng nằm ngay trên thanh menu của mọi trang. Lựa chọn của bạn được lưu trên thiết bị này.',
  thirdH: 'Những gì chúng tôi không kiểm soát',
  third:
    'Đặt món online chạy trên Toast, bản đồ của Google, và các phim trên trang The Entertainment do YouTube, Instagram và TikTok lưu trữ. Chúng tôi chọn đối tác có cam kết trợ năng riêng — nhưng nếu dịch vụ nào gây khó khăn, hãy gọi cho chúng tôi, chúng tôi sẵn lòng nhận đơn hàng hoặc đặt bàn qua điện thoại.',
  feedbackH: 'Cho chúng tôi biết nếu có gì khó dùng',
  feedback:
    'Nếu phần nào của trang web gây khó khăn cho bạn, hãy cho chúng tôi biết — chúng tôi sẽ sửa hoặc hỗ trợ bạn theo cách khác. Chúng tôi đọc mọi tin nhắn.',
  call: 'Gọi',
  email: 'Email',
  diningH: 'Tại nhà hàng',
  dining: 'Có câu hỏi về phòng ăn, chỗ đậu xe hay chỗ ngồi phù hợp với nhu cầu của bạn? Hãy gọi trước, chúng tôi sẽ sắp xếp.',
  updated: 'Rà soát lần cuối: tháng 11 năm 2026',
};

const es: A11yStatement = {
  metaTitle: 'Accesibilidad · Narwhal Thai Table',
  metaDescription:
    'Declaración de accesibilidad de Narwhal Thai Table: WCAG 2.1 AA, compatibilidad con teclado y lector de pantalla, controles de pausa, tamaño de texto y cómo contactarnos si algo resulta difícil de usar.',
  title: 'Accesibilidad en Narwhal Thai Table',
  lede:
    'Todos deberían poder leer nuestro menú, reservar mesa y comunicarse con nosotros, ya sea con un lector de pantalla, un teclado, control por voz, lupa o simplemente una página más tranquila.',
  standardH: 'Nuestro estándar',
  standard:
    'Construimos y probamos este sitio según las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1, nivel AA, y seguimos la versión 2.2. Cada página se revisa con herramientas automáticas y a mano con teclado y lector de pantalla, y la volvemos a revisar cada vez que añadimos algo nuevo.',
  featuresH: 'Lo que ya está incorporado',
  features: [
    'Todo funciona solo con el teclado, con un anillo de foco claro y un enlace “Saltar al contenido” en cada página.',
    'Las imágenes, botones y enlaces tienen nombres que un lector de pantalla puede pronunciar; los nombres de platos en tailandés y otros idiomas llevan su etiqueta de idioma para pronunciarse bien.',
    'El texto puede ampliarse al 200 % y cada página se reorganiza al ancho de un teléfono sin desplazamiento lateral.',
    'Todo lo que se mueve — la franja de horarios, las tiras de fotos, el video de fondo — se puede pausar, y el sitio sigue por sí solo los ajustes de reducir movimiento y alto contraste de tu dispositivo.',
    'Los formularios tienen etiquetas visibles, mensajes de error claros y sin límites de tiempo.',
    'Los colores están revisados por contraste y nada parpadea.',
  ],
  prefsH: 'Ajusta la página a tu manera',
  prefsLede: 'Estos mismos interruptores están a un toque en la barra de menú de cada página. Tus opciones se guardan en este dispositivo.',
  thirdH: 'Lo que no controlamos',
  third:
    'El pedido en línea funciona con Toast, el mapa es de Google y los videos de la página The Entertainment están alojados en YouTube, Instagram y TikTok. Elegimos socios que publican sus propios compromisos de accesibilidad, pero si alguno te da problemas, llámanos y con gusto tomaremos tu pedido o reserva por teléfono.',
  feedbackH: 'Dinos si algo es difícil de usar',
  feedback:
    'Si alguna parte de este sitio te resulta difícil, avísanos y lo corregiremos o te ayudaremos de otra manera. Leemos cada mensaje.',
  call: 'Llamar',
  email: 'Correo',
  diningH: 'En el restaurante',
  dining: '¿Preguntas sobre el comedor, el estacionamiento o un asiento adecuado a tus necesidades? Llama con anticipación y lo resolveremos.',
  updated: 'Última revisión: noviembre de 2026',
};

const zh: A11yStatement = {
  metaTitle: '无障碍 · Narwhal Thai Table',
  metaDescription: 'Narwhal Thai Table 无障碍声明：WCAG 2.1 AA 标准、键盘与屏幕阅读器支持、动态内容暂停控制、文字放大，以及遇到使用困难时的联系方式。',
  title: 'Narwhal Thai Table 的无障碍服务',
  lede: '无论您使用屏幕阅读器、键盘、语音控制、放大功能，还是只想要一个更安静的页面，每个人都应该能够阅读菜单、预订座位并联系我们。',
  standardH: '我们的标准',
  standard: '本网站依据《Web 内容无障碍指南》（WCAG）2.1 AA 级别构建和测试，并跟进 2.2 版本。每个页面都经过自动化工具检查，并用键盘和屏幕阅读器人工检查；每次新增内容后都会再次检查。',
  featuresH: '已内置的功能',
  features: [
    '所有功能仅用键盘即可操作，有清晰的焦点框，每页都有“跳到内容”链接。',
    '图片、按钮和链接都有屏幕阅读器可朗读的名称；泰语及其他外语菜名标注了语言，以便正确发音。',
    '文字可放大至 200%，每个页面在手机宽度下自动重排，无需横向滚动。',
    '所有动态内容——营业时间滚动条、图片滚动带、背景视频——都可以暂停，网站也会自动遵循您设备的“减少动态效果”和“高对比度”设置。',
    '表单有清楚的标签、易懂的错误提示，且没有时间限制。',
    '颜色经过对比度检查，没有闪烁内容。',
  ],
  prefsH: '按您的方式设置页面',
  prefsLede: '同样的开关在每个页面的菜单栏中一键可达。您的选择会保存在此设备上。',
  thirdH: '我们无法控制的部分',
  third: '在线点餐由 Toast 提供，地图来自 Google，“The Entertainment”页面的视频由 YouTube、Instagram 和 TikTok 托管。我们选择的合作伙伴都发布了各自的无障碍承诺——但如果其中任何一个让您不便，请致电我们，我们很乐意通过电话为您点餐或预订。',
  feedbackH: '如有使用困难，请告诉我们',
  feedback: '如果本网站的任何部分让您感到困难，请告诉我们，我们会修复或以其他方式帮助您。每一条留言我们都会阅读。',
  call: '致电',
  email: '电子邮件',
  diningH: '在餐厅',
  dining: '对用餐区、停车或适合您需求的座位有疑问？提前来电，我们会安排妥当。',
  updated: '最近审核：2026 年 11 月',
};

const zhTw: A11yStatement = {
  metaTitle: '無障礙 · Narwhal Thai Table',
  metaDescription: 'Narwhal Thai Table 無障礙聲明：WCAG 2.1 AA 標準、鍵盤與螢幕閱讀器支援、動態內容暫停控制、文字放大，以及遇到使用困難時的聯絡方式。',
  title: 'Narwhal Thai Table 的無障礙服務',
  lede: '無論您使用螢幕閱讀器、鍵盤、語音控制、放大功能，或只是想要一個更安靜的頁面，每個人都應該能夠閱讀菜單、訂位並聯絡我們。',
  standardH: '我們的標準',
  standard: '本網站依據《網頁內容無障礙指南》（WCAG）2.1 AA 等級建置與測試，並跟進 2.2 版。每個頁面都經過自動化工具檢查，並以鍵盤和螢幕閱讀器人工檢查；每次新增內容後都會再次檢查。',
  featuresH: '已內建的功能',
  features: [
    '所有功能僅用鍵盤即可操作，有清楚的焦點框，每頁都有「跳至內容」連結。',
    '圖片、按鈕和連結都有螢幕閱讀器可朗讀的名稱；泰語及其他外語菜名標註了語言，以便正確發音。',
    '文字可放大至 200%，每個頁面在手機寬度下自動重排，無需橫向捲動。',
    '所有動態內容——營業時間跑馬燈、圖片捲動帶、背景影片——都可以暫停，網站也會自動遵循您裝置的「減少動態效果」和「高對比」設定。',
    '表單有清楚的標籤、易懂的錯誤提示，且沒有時間限制。',
    '顏色經過對比度檢查，沒有閃爍內容。',
  ],
  prefsH: '依您的方式設定頁面',
  prefsLede: '同樣的開關在每個頁面的選單列中一鍵可達。您的選擇會保存在此裝置上。',
  thirdH: '我們無法控制的部分',
  third: '線上點餐由 Toast 提供，地圖來自 Google，「The Entertainment」頁面的影片由 YouTube、Instagram 和 TikTok 代管。我們選擇的合作夥伴都公布了各自的無障礙承諾——但如果其中任何一個讓您不便，請來電，我們很樂意透過電話為您點餐或訂位。',
  feedbackH: '如有使用困難，請告訴我們',
  feedback: '如果本網站的任何部分讓您感到困難，請告訴我們，我們會修正或以其他方式協助您。每一則留言我們都會閱讀。',
  call: '致電',
  email: '電子郵件',
  diningH: '在餐廳',
  dining: '對用餐區、停車或適合您需求的座位有疑問？請提前來電，我們會安排妥當。',
  updated: '最近審核：2026 年 11 月',
};

const ko: A11yStatement = {
  metaTitle: '접근성 · Narwhal Thai Table',
  metaDescription: 'Narwhal Thai Table 접근성 안내문: WCAG 2.1 AA 기준, 키보드와 스크린 리더 지원, 움직임 일시정지 기능, 글자 크기 조절, 그리고 이용이 불편할 때 연락하는 방법.',
  title: 'Narwhal Thai Table의 접근성',
  lede: '스크린 리더, 키보드, 음성 제어, 화면 확대를 사용하시든, 그저 차분한 페이지를 원하시든 — 누구나 메뉴를 읽고, 자리를 예약하고, 저희에게 연락할 수 있어야 합니다.',
  standardH: '저희의 기준',
  standard: '이 웹사이트는 웹 콘텐츠 접근성 지침(WCAG) 2.1 AA 수준에 맞춰 만들고 검사하며, 2.2 버전도 따라가고 있습니다. 모든 페이지를 자동 검사 도구와 키보드·스크린 리더로 직접 확인하고, 새 내용을 추가할 때마다 다시 확인합니다.',
  featuresH: '기본으로 갖춘 기능',
  features: [
    '키보드만으로 모든 기능을 쓸 수 있고, 또렷한 초점 테두리와 모든 페이지의 “본문으로 건너뛰기” 링크가 있습니다.',
    '이미지·버튼·링크에는 스크린 리더가 읽을 수 있는 이름이 있고, 태국어 등 외국어 요리 이름에는 언어를 표시해 올바르게 발음되도록 했습니다.',
    '글자를 200%까지 키울 수 있으며, 모든 페이지가 휴대폰 너비에서 가로 스크롤 없이 재배치됩니다.',
    '움직이는 것 — 영업시간 띠, 사진 띠, 배경 영상 — 은 모두 일시정지할 수 있고, 기기의 “움직임 줄이기”와 “고대비” 설정을 사이트가 자동으로 따릅니다.',
    '양식에는 보이는 라벨과 분명한 오류 안내가 있으며 시간 제한이 없습니다.',
    '색상은 대비를 확인했고, 깜박이는 요소가 없습니다.',
  ],
  prefsH: '원하는 대로 페이지 설정하기',
  prefsLede: '같은 스위치가 모든 페이지의 메뉴 막대에서 한 번의 탭으로 열립니다. 선택 사항은 이 기기에 저장됩니다.',
  thirdH: '저희가 관리하지 않는 부분',
  third: '온라인 주문은 Toast에서, 지도는 Google에서 제공되며, The Entertainment 페이지의 영상은 YouTube·Instagram·TikTok에 있습니다. 자체 접근성 약속을 공개한 파트너를 골랐지만, 이용에 불편이 있다면 전화 주세요 — 기꺼이 전화로 주문이나 예약을 받겠습니다.',
  feedbackH: '불편한 점이 있으면 알려 주세요',
  feedback: '이 웹사이트의 어느 부분이라도 이용하기 어렵다면 알려 주세요. 고치거나 다른 방법으로 도와드리겠습니다. 모든 메시지를 읽습니다.',
  call: '전화',
  email: '이메일',
  diningH: '매장에서',
  dining: '식당 공간, 주차, 필요에 맞는 좌석에 대해 궁금하신가요? 미리 전화 주시면 준비해 드리겠습니다.',
  updated: '최근 검토: 2026년 11월',
};

const ja: A11yStatement = {
  metaTitle: 'アクセシビリティ · Narwhal Thai Table',
  metaDescription: 'Narwhal Thai Table のアクセシビリティ方針：WCAG 2.1 AA 準拠、キーボードとスクリーンリーダー対応、動きの一時停止、文字サイズの調整、使いにくい点があったときの連絡先。',
  title: 'Narwhal Thai Table のアクセシビリティ',
  lede: 'スクリーンリーダー、キーボード、音声操作、拡大表示を使う方も、ただ落ち着いたページを好む方も — 誰もがメニューを読み、席を予約し、私たちに連絡できるべきだと考えています。',
  standardH: '私たちの基準',
  standard: 'このサイトは Web Content Accessibility Guidelines（WCAG）2.1 のレベル AA に沿って作り、テストしており、2.2 にも対応を進めています。すべてのページを自動チェックツールと、キーボードおよびスクリーンリーダーによる手動チェックで確認し、新しい内容を加えるたびに再確認しています。',
  featuresH: '備えている機能',
  features: [
    'すべての操作がキーボードだけで行え、はっきりしたフォーカス枠と、全ページに「本文へ移動」リンクがあります。',
    '画像・ボタン・リンクにはスクリーンリーダーが読み上げられる名前があり、タイ語などの外国語の料理名には言語を指定して正しく発音されるようにしています。',
    '文字は 200% まで拡大でき、どのページもスマートフォンの幅で横スクロールなしに再配置されます。',
    '動くもの — 営業時間のティッカー、写真の帯、背景動画 — はすべて一時停止でき、お使いの端末の「視差効果を減らす」「コントラストを上げる」設定にサイトが自動で従います。',
    'フォームには見えるラベルと分かりやすいエラー表示があり、時間制限はありません。',
    '色はコントラストを確認済みで、点滅するものはありません。',
  ],
  prefsH: 'ページを自分好みに設定する',
  prefsLede: '同じスイッチは、どのページでもメニューバーからワンタップで開けます。設定はこの端末に保存されます。',
  thirdH: '私たちが管理していないもの',
  third: 'オンライン注文は Toast、地図は Google、The Entertainment ページの動画は YouTube・Instagram・TikTok が提供しています。それぞれアクセシビリティ方針を公開しているパートナーを選びましたが、使いにくい場合はお電話ください。喜んで電話でご注文やご予約を承ります。',
  feedbackH: '使いにくい点があれば教えてください',
  feedback: 'このサイトのどこかが使いにくい場合はお知らせください。修正するか、別の方法でお手伝いします。すべてのメッセージを読んでいます。',
  call: '電話',
  email: 'メール',
  diningH: '店内について',
  dining: '店内、駐車場、ご希望に合う席についてのご質問は、事前にお電話ください。ご用意いたします。',
  updated: '最終確認：2026年11月',
};

const DICTS: Record<Locale, A11yStatement> = { en, th, vi, es, zh, 'zh-tw': zhTw, ko, ja };

export function accessibility(locale: Locale): A11yStatement {
  return DICTS[locale] ?? en;
}
