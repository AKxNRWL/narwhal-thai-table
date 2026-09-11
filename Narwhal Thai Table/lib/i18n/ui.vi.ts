import type { DeepPartial } from './merge';
import type { UiDict } from './ui.en';

/**
 * Tiếng Việt — bản dịch nội dung trang (giọng miền Nam, cách người Little
 * Saigon nói chuyện). Tên món giữ nguyên tiếng Anh + tiếng Thái như trên menu
 * và Toast, để gọi món và tra giá không bị lệch. Giá và giờ mở cửa không đổi.
 *
 * Owner decision, 11 Sep 2026: "เวียดนามได้ผลกว่า เวียดนามชอบกินอาหารไทย
 * แล้วคอมมูใหญ่มาก". Shipped without a native reviewer ("ขึ้นก่อนแล้วแก้ตามทีหลัง")
 * — corrections from guests are welcome and land here.
 *
 * Any key left out falls back to the English line in ui.en.ts.
 */
export const vi: DeepPartial<UiDict> = {
  meta: {
    home: {
      title: 'Narwhal Thai Table · Nhà hàng Thái ở Huntington Beach, CA',
      description:
        'Nhà hàng Thái gia đình ở Huntington Beach — ba anh chị em, ba mươi năm trong nghề, một bàn ăn trên đường Beach. Công thức Thái cung đình, nấu tươi cho từng dĩa. Mở cửa mỗi ngày: Thứ Hai–Sáu 11:30 AM–10 PM · Thứ Bảy–Chủ Nhật 12–10 PM.',
      ogTitle: 'Narwhal Thai Table · Huntington Beach',
      ogDescription: 'Ba anh chị em, ba mươi năm trong nghề nhà hàng, một bàn ăn trên đường Beach — món Thái cung đình, nấu tươi cho từng dĩa.',
    },
    menu: {
      title: 'Thực đơn',
      description: 'Thực đơn đầy đủ của Narwhal Thai Table — mười ba nhóm món Thái cung đình. Chạm vào món để đọc câu chuyện, nguyên liệu và cách ăn cho đúng điệu.',
      ogTitle: 'Thực đơn · Narwhal Thai Table',
      ogDescription: 'Mười ba nhóm món Thái cung đình, làm bằng tay.',
    },
    dish: {
      title: '{name} — Món Thái ở Huntington Beach',
      ogTitle: '{name} · Narwhal Thai Table',
      ogImageAlt: '{name} tại Narwhal Thai Table, Huntington Beach',
      notFound: 'Không tìm thấy món',
    },
    lunch: {
      title: 'Món trưa đặc biệt kiểu Thái ở Huntington Beach — Thứ Hai–Sáu từ $11.99 · Narwhal Thai Table',
      description:
        'Món trưa đặc biệt ngày thường trên đường Beach: Pad Thai, Pad See Ew, Pad Kee Mao, Krapow, Garlic & Pepper, Cashew, Mixed Vegetables, hoặc cà ri Yellow / Panang từ $11.99 — kèm xà lách tươi và chả giò giòn, thêm một chén súp khi ăn tại quán. Thứ Hai–Thứ Sáu, 11:30 AM–3:00 PM.',
      ogTitle: 'Món trưa đặc biệt · Narwhal Thai Table',
      ogDescription: 'Thứ Hai–Sáu 11:30–3 · từ $11.99 · xà lách + chả giò kèm mỗi phần, súp khi ăn tại quán.',
    },
    about: {
      title: 'Về Narwhal Thai Table — Ba anh chị em, một bàn ăn ở Huntington Beach',
      description:
        'Câu chuyện Narwhal Thai Table: ba anh chị em — Aileen, Annie và AK — mua lại nhà hàng Thai Gulf ở Huntington Beach vào tháng 7/2026, đổi tên, và nấu món Thái đúng như cách gia đình họ vẫn ăn từ nhỏ. Sự thật, mốc thời gian, và những gì bạn sẽ gặp ở bàn ăn.',
      ogTitle: 'Câu chuyện của chúng tôi · Narwhal Thai Table',
      ogImageAlt: 'Một mâm cơm gia đình tại Narwhal Thai Table',
    },
    contact: {
      title: 'Liên hệ',
      description: 'Đặt bàn, đặt tiệc và sự kiện riêng, giờ mở cửa, chỉ đường, và giải đáp những câu hỏi thường gặp về Narwhal Thai Table ở Huntington Beach.',
    },
    reservation: { title: 'Đặt bàn', description: 'Yêu cầu giữ bàn tại Narwhal Thai Table, Huntington Beach.' },
    message: { title: 'Liên hệ với chúng tôi', description: 'Thắc mắc, nhà cung cấp, báo chí — liên hệ Narwhal Thai Table.' },
    catering: { title: 'Đặt tiệc & sự kiện riêng', description: 'Đặt tiệc, bao trọn nhà hàng và sự kiện riêng tại Narwhal Thai Table.' },
  },

  /* ---------------- trang chủ ---------------- */
  hero: {
    eyebrow: 'Mở cửa mỗi ngày',
    featuredKicker: 'Đặc trưng · Poseidon',
    h1a: 'Từ cung đình Xiêm La',
    h1b: 'đến Huntington Beach',
    noteLead: 'Sawasdee, Huntington Beach — mời bạn ngồi vào bàn của chúng tôi.',
    note:
      'Chúng tôi là Aileen, Annie và AK — ba anh chị em đến mở một nhà hàng Thái trên đường Beach, vì nấu ăn là môn nghệ thuật duy nhất chúng tôi chưa bao giờ muốn buông. Ở đây, nghệ thuật nằm trên dĩa — những công thức Thái cung đình, nấu tươi cho từng phần gọi — và trong mọi thứ xung quanh: dây đèn lấp lánh, tiếng chảo xèo xèo, lời chào ở cửa. Và dù bạn là ai, tìm đến chúng tôi bằng cách nào, với chúng tôi bạn không phải là một số bàn. Bạn chính là lý do để nghệ thuật này tồn tại.',
    signed: '— Aileen, Annie & AK',
    hours: 'Mở cửa mỗi ngày — Thứ Hai–Sáu 11:30 AM – 10 PM · Thứ Bảy–Chủ Nhật 12 – 10 PM. Ghé thẳng quán, đặt món online, hoặc đặt bàn trước.',
    order: 'Đặt món online',
    explore: 'Xem thực đơn',
    reserve: 'Đặt bàn',
    narwhalTap: 'Chạm để xem kỳ lân biển nhảy',
    scroll: 'Cuộn xuống',
  },
  marquee: {
    eyebrow: 'Từ bếp',
    title: '{count} dĩa, *mỗi lần một chảo*.',
    lede: 'Mỗi dĩa ở đây đều mang theo “giấy tờ” của mình — Cơm dĩa, Món xào, Cà ri, Mì — để món bạn hình dung đúng là món được bưng ra. Chạm vào một dĩa để đọc câu chuyện phía sau.',
    spicy: 'Cay',
    alt: '{name} — {course} tại Narwhal Thai Table, Huntington Beach',
  },
  menuPreview: {
    eyebrow: 'Bếp đang nấu gì',
    title: 'Tươi ở đây không phải lời hứa. *Đó là lịch làm việc*.',
    lede: 'Không món nào ở bàn này được làm sẵn, không món nào chờ dưới đèn giữ nóng — mỗi dĩa chỉ bắt đầu khi bạn gọi. Đây là những món chúng tôi muốn giới thiệu trước; thực đơn đầy đủ, mười ba nhóm món, có riêng một trang.',
    signature: 'Đặc trưng',
    spicy: 'Cay',
    readStory: 'Đọc câu chuyện',
    seeMenu: 'Xem thực đơn đầy đủ',
  },
  bands: {
    siamEyebrow: 'Narwhal Thai Table',
    siamLine: 'Ba anh chị em, ba mươi năm trong nghề nhà hàng, một bàn ăn trên đường Beach.',
    patioEyebrow: '19072 Beach Blvd · Huntington Beach',
    patioLine: 'Mở cửa mỗi ngày — Thứ Hai–Sáu 11:30 AM – 10 PM · Thứ Bảy–Chủ Nhật 12 – 10 PM',
  },
  story: {
    eyebrow: 'Câu chuyện của chúng tôi',
    title: 'Có những gia đình xây nhà. *Nhà chúng tôi dựng bàn ăn*.',
    p1: 'Chúng tôi là ba anh chị em — Aileen, Annie và AK — với ba mươi năm trong nghề nhà hàng cộng lại: mở quán, đứng bếp, học cách làm cho một người lạ ngồi xuống ghế mà thấy thư thả. Rồi không biết từ lúc nào, Huntington Beach đã chinh phục chúng tôi — vị mặn trong gió, ánh nắng vàng trải dài trên PCH, cái cách thị trấn này vẫy chào chính mình trên đường ra cầu tàu.',
    p2: 'Vậy nên chúng tôi làm điều gia đình mình vẫn luôn làm với những nơi mình thương: nấu ăn cho nơi ấy. Narwhal Thai Table là lời hứa chúng tôi đã giữ suốt cả đời làm nghề — những công thức Thái bắt nguồn từ truyền thống cung đình, nấu tươi cho từng dĩa một, từ nguyên liệu chúng tôi chọn theo cách chậm rãi và cố chấp. Không đường tắt, không “gần đúng”.',
    p3: 'Nếu địa chỉ này thấy quen, thì đúng là vậy. Nhiều năm liền nơi đây là Thai Gulf — quán quen của cả khu. Gia đình chúng tôi mua lại, treo bảng tên mới lên cửa, và biến nó thành của mình: công thức của mình, cái cối của mình, lời chào của mình. Nếu bạn đến đây vì tìm Thai Gulf — chào mừng bạn quay lại. Bàn ăn vẫn còn ở đây.',
    readMore: 'Đọc trọn câu chuyện →',
    closing: 'Bởi thứ chúng tôi dọn ra không chỉ là bữa tối. Mà là tất cả những gì quanh nó — hơi ấm, lời chào, và mong bạn quay lại.',
    stats: [
      { num: '3', label: 'Anh chị em, một bàn ăn' },
      { num: '30', label: 'Năm trong nghề nhà hàng' },
      { num: 'HB', label: 'Quê nhà của chúng tôi' },
    ],
    artAlt: 'Tranh nét vàng một bữa yến tiệc cung đình Thái — mâm chân cao nhiều tầng, hoa sen và nến dưới mái cung điện',
    artCaption: 'Thành lập MMXXVI · Huntington Beach',
  },
  lunchHome: {
    eyebrow: 'Món trưa đặc biệt ngày thường',
    title: 'Món trưa đặc biệt kiểu Thái, *từ {price}*',
    lede: 'Chọn một dĩa — mỗi phần trưa đều kèm {includes}.',
    includes: 'xà lách tươi và một cuốn chả giò giòn, thêm một chén súp khi ăn tại quán',
    days: 'Thứ Hai – Thứ Sáu',
    tile: 'Món trưa đặc biệt · từ {price}',
    alt: '{label} — món trưa đặc biệt ngày thường kèm xà lách và chả giò tại Narwhal Thai Table, Huntington Beach',
    platesLabel: 'Các dĩa trong món trưa đặc biệt',
    call: 'Gọi điện đặt phần trưa',
    seeMenu: 'Xem thực đơn trưa',
  },
  experience: {
    eyebrow: 'Trải nghiệm',
    title: 'Bạn đến vì bữa tối. *Bạn ra về với nhiều hơn thế*.',
    lede: 'Ba điều giữ ngôi nhà này đứng vững. Ba mươi năm làm nhà hàng đã dạy chúng tôi, và chúng tôi thà mãi là một quán nhỏ còn hơn đánh đổi dù chỉ một điều.',
    artAlt: 'Tranh nét vàng một chiếc chảo Thái đang hất giữa ngọn lửa — tôm, húng quế và ớt bay trong không trung',
    artCaption: 'Chảo chưa nổi lửa cho đến khi bạn gọi món',
    pillars: [
      {
        numeral: 'I.',
        title: 'Tươi, từng dĩa một',
        body: 'Chảo chưa nổi lửa cho đến khi phiếu gọi món của bạn tới bếp. Rau vào chảo còn sống và ra dĩa vẫn còn độ giòn; rau thơm được cắt ngay trong giờ bạn thưởng thức. Không món nào chờ dưới đèn giữ nóng — không tươi thì không ra khỏi bếp.',
      },
      {
        numeral: 'II.',
        title: 'Chọn bằng tay',
        body: 'Sả, riềng, lá chanh Thái, rễ ngò, ớt hiểm — cắt tươi, không bao giờ lấy từ hũ. Gia vị khô được rang và xay tại đây, từng mẻ nhỏ, vì gia vị xay sẵn mất mùi chỉ sau vài tuần. Mọi loại sốt cà ri trong bếp này đều bắt đầu từ nguyên liệu nguyên và một cái cối. [Cách nhận ra một bếp Thái thật (English) →](/thai-food-orange-county)',
      },
      {
        numeral: 'III.',
        title: 'Từ gia đình chúng tôi',
        body: 'Aileen, Annie và AK — ba anh chị em lớn lên trong phòng ăn nhà hàng và chưa bao giờ muốn rời đi. Chúng tôi vẫn tin điều tuyệt nhất một nhà hàng có thể dọn ra là cảm giác được mong đợi.',
      },
    ],
  },
  room: {
    eyebrow: 'Không gian',
    title: 'Một căn phòng nhỏ với *thật nhiều tấm lòng*.',
    lede: 'Dây đèn giăng trên sân hiên, lan ở quầy, một ly rượu ngon trong lúc bếp rộn ràng. Kéo cả nhà đến — nhớ chừa bụng cho xôi xoài, và chúng tôi luôn vui lòng kê thêm một chiếc ghế.',
    videoLabel: 'Bên trong Narwhal Thai Table — phòng ăn trong đêm khai trương',
    storefrontAlt: 'Mặt tiền Narwhal Thai Table lúc chạng vạng, dây đèn sáng trên sân hiên',
    spreadAlt: 'Một mâm cơm gia đình — lẩu tom yum hải sản, crying tiger, orange chicken, rau muống xào và trà Thái đá',
  },
  contactHome: {
    eyebrow: 'Ghé thăm chúng tôi',
    title: 'Báo chúng tôi biết bạn sẽ đến — *phần còn lại để chúng tôi lo*.',
    cards: {
      reservation: { title: 'Đặt bàn', go: 'Giữ một bàn', body: 'Xin một bàn và cứ xem như đã được giữ — chúng tôi xác nhận trong vài giờ.' },
      catering: { title: 'Đặt tiệc & sự kiện', go: 'Lên kế hoạch sự kiện', body: 'Bao trọn nhà hàng, tiệc kiểu gia đình, đồ ăn mang đi xa vẫn ngon — dịp của bạn, bàn ăn của chúng tôi.' },
      message: { title: 'Chào hỏi', go: 'Gửi lời nhắn', body: 'Thắc mắc, ý tưởng, một lời chào từ hàng xóm — mọi lời nhắn đều đến tay một trong ba anh chị em chúng tôi.' },
    },
    findEyebrow: 'Tìm chúng tôi',
    findTitle: 'Ghé bàn ăn',
    findHours: 'Mở cửa mỗi ngày · Thứ Hai–Sáu 11:30 AM – 10:00 PM · Thứ Bảy–Chủ Nhật 12:00 PM – 10:00 PM',
    mapTitle: 'Narwhal Thai Table trên Google Maps — 19072 Beach Blvd, Huntington Beach',
    mapLink: 'Chỉ đường',
  },

  /* ---------------- /vi/menu ---------------- */
  menuPage: {
    eyebrow: 'Thực đơn',
    title: 'Thực đơn đầy đủ — *chạm vào một dĩa để nghe câu chuyện của nó*.',
    intro: 'Mười ba nhóm món, nấu theo từng phần gọi từ miếng đầu tiên đến miếng ngọt cuối cùng. ★ là những món đặc trưng của quán. Mỗi dĩa đều mang câu chuyện riêng — lịch sử của công thức, cách ăn cho ngon, và món gì nên gọi kèm.',
    lunchPill: 'Thứ Hai–Sáu · 11:30–3',
    lunchLine: 'Món trưa đặc biệt từ $11.99 — Pad Thai, cà ri, krapow & nhiều món khác, kèm xà lách và chả giò',
    lunchGo: 'Xem món trưa',
    jsonLdName: 'Thực đơn Narwhal Thai Table',
    sidesDescription: 'Chọn thịt (gà, heo, đậu hũ, bò, tôm, hải sản) và món kèm — cơm trắng, cơm gạo lứt, cơm nếp, trứng ốp la, trứng chiên.',
  },

  /* ---------------- /vi/menu/[slug] ---------------- */
  dish: {
    back: 'Về thực đơn',
    photoSoon: 'Hình sắp có',
    signature: 'Đặc trưng',
    signatureTag: '★ Đặc trưng',
    spicy: 'Cay',
    from: 'Món này *từ đâu tới*',
    howToEat: 'Ăn sao *cho đúng điệu*',
    inTheBowl: 'Trong dĩa *có gì*',
    goesWith: 'Gọi kèm *món gì*',
    toDrink: 'Thức uống',
    onTheSide: 'Món kèm',
    goodToKnow: 'Nên *biết*',
    allergensIntro: 'Món này có các thành phần dễ gây dị ứng sau — nếu bạn nhạy cảm với thứ gì, hãy báo khi gọi món và chúng tôi sẽ điều chỉnh:',
    allergen: {
      peanut: 'đậu phộng',
      'tree-nut': 'hạt (hạt điều, v.v.)',
      shellfish: 'hải sản có vỏ',
      fish: 'cá / nước mắm',
      gluten: 'gluten',
      soy: 'đậu nành',
      dairy: 'sữa',
      egg: 'trứng',
      sesame: 'mè',
    },
    chefNote: '— Từ bếp của chúng tôi',
    noStory: 'Chúng tôi vẫn đang viết câu chuyện cho dĩa này — sẽ sớm có ở đây. Trong lúc chờ, cứ hỏi nhân viên về món này khi bạn ghé.',
    more: 'Thêm món trong nhóm *{category}*',
    guide: 'Chưa biết đánh giá một dĩa như vầy ra sao? Đọc cẩm nang của chúng tôi về [món Thái ngon nhất Orange County (English)](/thai-food-orange-county) — năm dấu hiệu của một bếp Thái thật, và nên gọi gì khi đã ngồi vào bàn.',
    order: 'Đặt món online',
    reserve: 'Đặt bàn',
    alt: '{name} — {description} Phục vụ tại Narwhal Thai Table, Huntington Beach.',
    breadcrumbHome: 'Narwhal Thai Table',
    breadcrumbMenu: 'Thực đơn',
    sidesSection: 'Món kèm & chọn thịt',
    menuName: 'Thực đơn Narwhal Thai Table',
  },

  /* ---------------- /vi/lunch ---------------- */
  lunch: {
    eyebrow: 'Món trưa đặc biệt · Thứ Hai–Sáu',
    title: 'Bữa trưa ngày thường, *nấu theo phần gọi* — từ $11.99.',
    lede: 'Thứ Hai đến Thứ Sáu, 11:30 AM đến 3:00 PM. Chọn một dĩa bên dưới, phần ăn kèm xà lách tươi và một cuốn chả giò giòn — thêm một chén súp khi ăn tại quán. Nhanh, ấm cúng, và ngay trên đường Beach: giờ nghỉ trưa mà bạn thật sự mong tới.',
    hoursLine: 'Thứ Hai–Sáu 11:30 AM – 3:00 PM · ăn tại quán hoặc mang về · ',
    trayLabel: 'Mỗi phần trưa đặc biệt gồm những gì',
    tray: [
      '**Dĩa chính của bạn.** Chín lựa chọn — mì xào, cơm dĩa, rau xào, hoặc cà ri — món nào cũng nấu khi bạn gọi, cay theo mức bạn muốn.',
      '**Xà lách và chả giò.** Mỗi phần trưa đều kèm xà lách tươi và một cuốn chả giò giòn, dù ăn tại quán hay mang về.',
      '**Súp, khi bạn ngồi lại.** Ăn tại quán thì có thêm một chén súp — và nếu còn dư mười phút, xôi xoài ở ngay đó.',
    ],
    pickTitle: 'Chọn *dĩa của bạn*.',
    pickLede: 'Chạm vào một dĩa để đọc câu chuyện của nó. Món trưa đặc biệt ngày thường bắt đầu từ $11.99 — hỏi chúng tôi giá của dĩa bạn đang để mắt tới.',
    from: 'từ',
    tag: 'Món trưa đặc biệt',
    spicy: 'Cay',
    readStory: 'Đọc câu chuyện',
    alt: '{name} — món trưa đặc biệt ngày thường{withSides} tại Narwhal Thai Table, Huntington Beach',
    altSides: ' kèm xà lách và chả giò',
    goodTitle: 'Nên biết khi *ăn trưa*',
    good: [
      '**Chỉ ngày thường.** Món trưa đặc biệt phục vụ Thứ Hai–Thứ Sáu đến 3 giờ chiều. Cuối tuần, và sau 3 giờ các ngày thường, [thực đơn đầy đủ](/menu) phục vụ cả ngày.',
      '**Mang về văn phòng?** Gọi [(714) 378-6003](tel:+17143786003) là món sẽ sẵn sàng khi bạn tấp xe vào — bãi đậu xe miễn phí ngay trước quán. Mọi món trong thực đơn thường cũng có thể đặt online để [đến lấy]({order}).',
      '**Độ cay và đổi món.** Dĩa nào cũng nấu khi bạn gọi, nên bạn tự chọn độ cay — từ nhẹ đến cay kiểu Thái — và phần lớn các dĩa này có thể đổi thịt thành đậu hũ hoặc rau. Cứ nói khi gọi món, và luôn báo nếu bạn dị ứng thứ gì.',
      '**Đi từ Fountain Valley, Westminster hay Little Saigon?** Chúng tôi ở góc Beach Blvd & Garfield — khoảng 8 phút từ trung tâm [Fountain Valley (English)](/thai-food-fountain-valley) và 12 phút chạy thẳng đường Beach từ [Westminster](/vi/nha-hang-thai-little-saigon).',
    ],
    call: 'Gọi điện đặt phần trưa',
    directions: 'Chỉ đường',
    seeMenu: 'Xem thực đơn đầy đủ',
    jsonLdName: 'Món trưa đặc biệt Narwhal Thai Table',
    jsonLdDescription: 'Món trưa đặc biệt ngày thường, Thứ Hai–Thứ Sáu 11:30 AM–3:00 PM, từ $11.99. Mỗi phần trưa kèm xà lách tươi và chả giò giòn, thêm một chén súp khi ăn tại quán.',
    jsonLdSection: 'Món trưa đặc biệt (Thứ Hai–Thứ Sáu, 11:30 AM–3:00 PM)',
    jsonLdSectionDescription: 'Chọn một dĩa. Phục vụ kèm xà lách tươi và chả giò giòn; có thêm một chén súp khi ăn tại quán.',
    jsonLdItem: 'Món trưa đặc biệt — {name}',
    breadcrumbHome: 'Trang chủ',
    breadcrumb: 'Món trưa đặc biệt',
  },

  /* ---------------- /vi/about ---------------- */
  about: {
    eyebrow: 'Câu chuyện của chúng tôi',
    title: 'Ba anh chị em. *Một bàn ăn.*',
    lede: 'Chúng tôi là Aileen, Annie và AK — một gia đình Thái với ba mươi năm trong nghề nhà hàng cộng lại, và một phòng ăn nhỏ trên đường Beach, nơi chúng tôi nấu những món mình lớn lên cùng.',
    spreadAlt: 'Một mâm cơm gia đình tại Narwhal Thai Table ở Huntington Beach — lẩu tom yum hải sản, crying tiger, orange chicken, rau muống xào và trà Thái đá',
    storefrontAlt: 'Mặt tiền Narwhal Thai Table trên đường Beach lúc chạng vạng, dây đèn giăng trên sân hiên',
    h2Origin: 'Bàn ăn này *ra đời thế nào*',
    origin1: 'Nhiều năm liền, góc đường Beach và Garfield có một nhà hàng Thái quen thuộc của khu phố tên là Thai Gulf. Tháng 7 năm 2026, gia đình chúng tôi mua lại, treo bảng tên mới lên cửa, và bắt đầu nấu theo cách nhà mình vẫn nấu: sốt cà ri giã từ ớt nguyên trái, tỏi, sả và riềng trong cối đá; gia vị khô rang và xay tại đây từng mẻ nhỏ; mỗi dĩa chỉ bắt đầu khi có người gọi.',
    origin2: 'Chúng tôi mở cửa nhẹ nhàng vào Chủ Nhật, ngày 9 tháng 8 năm 2026, và mở cửa mỗi ngày từ đó. Nếu bạn đến đây vì tìm Thai Gulf — chào mừng bạn quay lại. Địa chỉ cũ, căn phòng nhỏ ấm áp cũ, tên mới, nếp bếp mới. Bàn ăn vẫn còn ở đây.',
    h2Values: 'Chúng tôi *đứng trên điều gì*',
    values: [
      '**Tươi, từng dĩa một.** Chảo chưa nổi lửa cho đến khi phiếu gọi món của bạn tới bếp. Không món nào chờ dưới đèn giữ nóng.',
      '**Làm bằng tay.** Sả, riềng, lá chanh Thái, rễ ngò và ớt hiểm, cắt tươi; sốt cà ri bắt đầu từ nguyên liệu nguyên trong cối.',
      '**Nấu riêng cho bạn.** Bạn chọn độ cay, từ nhẹ đến cay kiểu Thái. Nhiều món có thể làm chay. Cho chúng tôi biết bạn dị ứng gì, chúng tôi sẽ tư vấn thật lòng.',
      '**Từ gia đình chúng tôi.** Mọi lời nhắn gửi đến [{email}](mailto:{email}) đều đến tay một trong ba anh chị em, và khi bạn để lại đánh giá, chính một người trong nhà trả lời — không phải dịch vụ thuê ngoài.',
    ],
    h2Order: 'Nên *gọi gì*',
    order:
      'Bắt đầu với [Narwhal Chicken Wings](/menu/narwhal-chicken-wings), rồi chia nhau một món cà ri và một món chảo: [Panang Curry](/menu/panang-curry) và [OG Pad Thai](/menu/og-pad-thai) là hai món được hỏi nhiều nhất. Mê hải sản thì gọi [Super Crab Fried Rice](/menu/crab-fried-rice) hoặc một con [cá pompano chiên nguyên con](/menu/fried-whole-pompano) cho cả bàn. Nếu nhớ nhà, ghé góc Isaan — [som tum](/menu/som-tum-thai), [larb](/menu/larb), [crying tiger](/menu/crying-tiger) — hoặc một tô [hủ tiếu thuyền Thái](/menu/thai-boat-noodles). Ngày thường đến 3 giờ chiều, [món trưa đặc biệt](/lunch) bắt đầu từ $11.99. Và nếu bạn muốn biết chúng tôi đánh giá một bếp Thái ra sao, kể cả bếp mình, chúng tôi đã viết một cẩm nang về [món Thái ngon nhất Orange County (English)](/thai-food-orange-county).',
    factsTitle: 'Tóm tắt ngắn, *cho rõ ràng*',
    facts: [
      { k: 'Tên', v: 'Narwhal Thai Table (mọi người cũng hay gọi “Narwhal Thai” hoặc “Narwhal HB”)' },
      { k: 'Trước đây', v: 'Thai Gulf Restaurant — cùng địa chỉ; gia đình chúng tôi mua lại và đổi tên vào tháng 7/2026' },
      { k: 'Chủ quán', v: 'Ba anh chị em — Aileen, Annie và AK — dưới tên Narwhal Hospitality LLC' },
      { k: 'Mở cửa', v: 'Mở cửa thử Chủ Nhật 9/8/2026 · mở mỗi ngày từ đó · khai trương chính thức sắp tới' },
      { k: 'Ở đâu', v: '[{street}, Huntington Beach, CA 92648]({directions}) — Beach Blvd góc Garfield Ave, đậu xe miễn phí trong bãi của khu plaza' },
      { k: 'Giờ mở cửa', v: 'Mở cửa mỗi ngày · Thứ Hai–Sáu 11:30 AM–10 PM · Thứ Bảy–Chủ Nhật 12–10 PM · [món trưa đặc biệt](/lunch) Thứ Hai–Sáu 11:30–3' },
      { k: 'Chúng tôi nấu gì', v: 'Món Thái đúng như cách chúng tôi lớn lên cùng — sốt cà ri giã trong cối đá, mì xào và cơm chiên nấu theo phần gọi, cá chiên nguyên con, một góc Isaan với som tum, larb và crying tiger. [{count} món trong 13 nhóm](/menu).' },
      { k: 'Giá', v: 'Phần lớn các dĩa $12–20, món hải sản đến $35 · [món trưa đặc biệt](/lunch) từ $11.99' },
      { k: 'Không gian', v: 'Một phòng ăn nhỏ và sân hiên cho phép dắt chó dưới dây đèn · vài loại rượu vang theo ly · xôi xoài cho cả bàn' },
      { k: 'Cách thưởng thức', v: 'Ăn tại quán · [đặt bàn](/contact/reservation) · [đến lấy và giao tận nơi (English)](/order) · [đặt tiệc và sự kiện riêng](/contact/catering)' },
      { k: 'Thanh toán', v: 'Thẻ tín dụng và thẻ ghi nợ, Apple Pay và Google Pay (và tiền mặt)' },
      { k: 'Ngôn ngữ', v: 'Tiếng Anh và tiếng Thái (trang web có bản tiếng Việt)' },
      { k: 'Liên hệ', v: '[(714) 378-6003](tel:+17143786003) · [{email}](mailto:{email}) · [bộ tài liệu báo chí (English)](/press)' },
    ],
    timelineTitle: 'Mốc thời gian',
    timeline: [
      '**Trước 2026 —** Thai Gulf Restaurant phục vụ khu phố tại 19072 Beach Blvd.',
      '**Tháng 7/2026 —** Gia đình chúng tôi mua lại và đổi tên thành Narwhal Thai Table. Công thức mới, nếp bếp mới, cùng địa chỉ.',
      '**Chủ Nhật 9/8/2026 —** Mở cửa thử. Mở mỗi ngày từ đó.',
      '**Cuối tháng 8/2026 —** Bắt đầu [món trưa đặc biệt](/lunch) ngày thường, Thứ Hai–Thứ Sáu từ $11.99.',
      '**Sắp tới —** Khai trương chính thức, cùng màn ra mắt đầu bếp. Theo dõi [@narwhalthaitablehb](https://www.instagram.com/narwhalthaitablehb/) để không bỏ lỡ.',
    ],
    seeMenu: 'Xem thực đơn',
    reserve: 'Đặt bàn',
    directions: 'Chỉ đường',
    breadcrumbHome: 'Trang chủ',
    breadcrumb: 'Về chúng tôi',
    slogan: 'Đến như hàng xóm, về như người nhà.',
    coOwner: 'Đồng sở hữu',
  },

  /* ---------------- /vi/contact ---------------- */
  contact: {
    eyebrow: 'Ghé thăm chúng tôi',
    title: 'Chúng tôi có thể *giúp gì?*',
    cards: {
      reservation: { title: 'Đặt bàn', go: 'Giữ một bàn', body: 'Yêu cầu giữ bàn — chúng tôi xác nhận trong vài giờ.' },
      catering: { title: 'Đặt tiệc & sự kiện', go: 'Lên kế hoạch sự kiện', body: 'Bao trọn nhà hàng, tiệc nếm thử kiểu gia đình, nấu tiệc tận nơi.' },
      message: { title: 'Chào hỏi', go: 'Gửi lời nhắn', body: 'Thắc mắc, nhà cung cấp, báo chí — chúng tôi sẽ hồi âm.' },
    },
    findEyebrow: 'Tìm chúng tôi',
    findTitle: 'Ghé bàn ăn',
    findHours: 'Mở cửa mỗi ngày · Thứ Hai–Sáu 11:30 AM – 10:00 PM · Thứ Bảy–Chủ Nhật 12:00 PM – 10:00 PM',
    faqEyebrow: 'Nên biết',
    faqTitle: 'Những câu hỏi *chúng tôi hay nghe*',
    faqs: [
      {
        q: 'Quán có phải là Thai Gulf không?',
        a: 'Có thể nói vậy — chúng tôi mua lại Thai Gulf, rồi dựng lại thành quán của mình. Cùng địa chỉ trên đường Beach, tên mới, nếp mới: ba anh chị em trong bếp, sốt cà ri bắt đầu từ cối đá, mỗi dĩa nấu khi bạn gọi. Nếu bạn đến đây vì tìm Thai Gulf — chào mừng bạn quay lại. Bàn ăn vẫn còn ở đây. [Đọc trọn câu chuyện](/about).',
      },
      {
        q: 'Quán có nhận đặt bàn không?',
        a: 'Có — [yêu cầu giữ bàn](/contact/reservation) và chúng tôi xác nhận trong vài giờ, hoặc gọi [(714) 378-6003](tel:+17143786003). Ghé thẳng quán không đặt trước cũng luôn được chào đón.',
      },
      {
        q: 'Quán có bán mang về và giao tận nơi không?',
        a: 'Cả hai. Đặt online rồi đến lấy nóng hổi trên đường Beach, hoặc đặt giao qua DoorDash — mọi thứ có trên [trang đặt món (English)](/order).',
      },
      {
        q: 'Giờ mở cửa thế nào?',
        a: 'Mở cửa mỗi ngày: Thứ Hai–Sáu 11:30 AM–10 PM · Thứ Bảy–Chủ Nhật 12–10 PM. [Món trưa đặc biệt](/lunch) ngày thường phục vụ Thứ Hai–Sáu 11:30 AM–3 PM.',
      },
      {
        q: 'Quán có món trưa đặc biệt không?',
        a: 'Có — Thứ Hai đến Thứ Sáu, 11:30 AM đến 3 PM, [món trưa đặc biệt](/lunch) bắt đầu từ $11.99: Pad Thai, Pad See Ew, Pad Kee Mao, Krapow, Garlic & Pepper, Cashew, Mixed Vegetables, hoặc cà ri Yellow / Panang. Mỗi phần trưa kèm xà lách tươi và chả giò giòn, thêm một chén súp khi ăn tại quán. Gọi trước [(714) 378-6003](tel:+17143786003) nếu muốn đến lấy.',
      },
      {
        q: 'Đồ ăn cay cỡ nào?',
        a: 'Cay theo ý bạn. Món nào cũng nấu theo phần gọi, nên bạn tự chọn độ cay — nhẹ, vừa, cay, hoặc cay kiểu Thái. Chưa chắc? Cứ bắt đầu ở mức vừa. Chúng tôi thà bạn quay lại ngày mai còn hơn phải toát mồ hôi tối nay.',
      },
      {
        q: 'Quán nấu chay được không? Dị ứng thì sao?',
        a: 'Nhiều món có thể làm chay — cứ hỏi. Ăn kiêng gluten? Báo khi gọi món và chúng tôi sẽ chỉ những dĩa dùng gạo có thể nấu không nước tương hay lúa mì trong ngày hôm đó. Và luôn báo nếu bạn dị ứng thứ gì: chúng tôi nấu từng dĩa tươi, nhưng bếp dùng đậu phộng, hải sản có vỏ, trứng, đậu nành và lúa mì mỗi ngày, nên không thể hứa hoàn toàn không lẫn.',
      },
      {
        q: 'Nên gọi món gì trước?',
        a: 'Những dĩa được hỏi nhiều nhất: [Super Crab Fried Rice](/menu/crab-fried-rice), [Narwhal Chicken Wings](/menu/narwhal-chicken-wings), [OG Pad Thai](/menu/og-pad-thai), [Panang Curry](/menu/panang-curry) và [Fried Whole Pompano](/menu/fried-whole-pompano) cho cả bàn. Gọi một món cà ri và một món chảo để chia nhau, và nhớ chừa bụng cho tráng miệng.',
      },
      {
        q: 'Tráng miệng nên gọi gì?',
        a: '[Mango Sticky Rice](/menu/mango-sticky-rice) — xôi xoài — là món chúng tôi muốn tiễn bạn ra về cùng: xôi nước cốt dừa còn ấm, xoài chín, một chút muối thoảng qua. [Coconut Ice Cream & Bread](/menu/coconut-ice-cream-bread) là món đường phố Bangkok kinh điển, còn [Narwhal Sundae](/menu/narwhal-sundae) sinh ra để chia nhau.',
      },
      {
        q: 'Quán ở đâu chính xác?',
        a: '19072 Beach Blvd, Suite A & B, Huntington Beach — trong khu plaza trên đường Beach góc Garfield Avenue. [Chỉ đường]({directions}).',
      },
      {
        q: 'Có chỗ đậu xe không?',
        a: 'Có, và miễn phí — đậu trong bãi của khu plaza ngay trước quán. Nếu bãi đông, gần đó cũng có chỗ đậu ngoài đường miễn phí. Đi từ [Fountain Valley (English)](/thai-food-fountain-valley), Westminster hay [Little Saigon](/vi/nha-hang-thai-little-saigon)? Chúng tôi cách khoảng 8 đến 12 phút.',
      },
      {
        q: 'Quán có nhận nấu tiệc không?',
        a: 'Có — nấu tiệc tận nơi, tiệc nếm thử kiểu gia đình, và bao trọn nhà hàng. [Kể chúng tôi nghe về sự kiện của bạn](/contact/catering).',
      },
    ],
  },
  contactSub: {
    back: 'Liên hệ',
    reservation: {
      h1: 'Đặt bàn tại Narwhal Thai Table, Huntington Beach',
      title: 'Đặt bàn',
      sent: 'Yêu cầu đặt bàn của bạn được gửi thẳng đến ',
    },
    message: {
      h1: 'Liên hệ Narwhal Thai Table, Huntington Beach',
      title: 'Liên hệ với chúng tôi',
      sent: 'Lời nhắn của bạn được gửi thẳng đến ',
    },
    catering: {
      h1: 'Đặt tiệc Thái & sự kiện riêng ở Huntington Beach',
      title: 'Đặt tiệc & sự kiện riêng',
      sent: 'Yêu cầu đặt tiệc của bạn được gửi thẳng đến ',
    },
  },

  /* ---------------- 404 (món) ---------------- */
  notFound: {
    back: 'Về thực đơn',
    title: 'Dĩa này không có *trên bàn này*.',
    body: 'Có thể đường dẫn đã cũ, hoặc chúng tôi đã đổi tên món. Xem thực đơn đầy đủ — bếp chắc chắn có món còn ngon hơn cho bạn.',
    cta: 'Xem thực đơn đầy đủ',
  },
};
