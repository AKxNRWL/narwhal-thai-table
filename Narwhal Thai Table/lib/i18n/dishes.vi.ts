import type { Pairing } from '@/lib/dishes';

/**
 * Vietnamese prose for every dish on the menu — descriptions, ledes, histories
 * and (for the signatures) how-to-eat notes, chef notes, ingredient lists and
 * pairings. Keyed by the dish slug in lib/dishes.ts; merged over the English
 * record by lib/i18n/dish.ts, so a missing field simply shows English.
 *
 * Names, Thai script, prices, categories and allergen codes live only in
 * lib/dishes.ts and are never repeated here. Southern (Sài Gòn) register —
 * "dĩa", "heo", "chén", "chả giò" — for the Little Saigon reader.
 *
 * Translated 11 Sep 2026 from the English copy (owner: ship first, refine
 * from feedback — "ขึ้นก่อนแล้วแก้ตามทีหลัง"). Edit freely; keep the facts.
 */
export type DishVi = {
  description?: string;
  variants?: string[];
  ingredients?: string[];
  pairing?: Pairing;
  story?: { lede?: string; history?: string; howToEat?: string; chefNote?: string };
};

export const DISHES_VI: Record<string, DishVi> = {
  "narwhal-chicken-wings": {
    description: "Cánh gà giòn rụm, trộn nóng với gia vị Thái nhà làm — thơm tỏi, dậy tiêu, mọng nước tới tận xương.",
    story: {
      lede: "Món đầu tiên căn bếp này từng nấu — và cũng là món chúng tôi sẽ không bao giờ gỡ khỏi thực đơn.",
      history: "Công thức nào của Narwhal cũng bắt đầu từ một lần thử nghiệm trong bữa cơm nhân viên, và món này thì chưa bao giờ sống sót nổi qua cái bàn ăn đó. Suốt mùa hè sửa quán, bếp trưởng của chúng tôi cứ trộn hết mẻ thử này tới mẻ thử khác vào thứ gia vị Thái khô do chính tay chị pha — tỏi vàng, tiêu trắng, thoáng một chút rễ ngò — cho tới khi cả đội bắt đầu đi làm sớm chỉ để giành cho được một dĩa. Đến lúc in thực đơn cho buổi khai trương thử, món cánh gà đã tự lấy tên quán đặt cho mình.",
    },
  },
  "chicken-wings": {
    description: "Bản kinh điển — da vàng giòn tan, bên trong nóng hổi mọng nước.",
    story: {
      lede: "Bằng chứng rằng một cái cánh gà hoàn hảo chẳng cần khoác áo gì cả — chỉ cần lửa, muối và sự kiên nhẫn.",
      history: "Gà chiên là một trong những mối tình vỉa hè lớn nhất của người Thái: mấy xe gai tod (gà chiên kiểu Thái) ướp hương cho từng khu chợ trên khắp xứ này, và người bán nào cũng giữ kỹ công thức bột áo với thời gian chiên như giữ của gia truyền. Chúng tôi giữ đúng niềm tin đó — áo một lớp bột thật mỏng rồi chiên lửa già, để da nổ giòn mà thịt vẫn nóng hổi mọng nước. Không cần nước chấm. Mà đó mới đúng là cái hay.",
    },
  },
  "thai-fish-cake": {
    description: "Chả cá dai mềm, chiên tới màu đồng sậm — đồ chua dưa leo ớt mát lạnh & đậu phộng giã cho giòn.",
    story: {
      lede: "Món kinh điển của những phiên chợ miền sông nước Thái Lan — dai bật, lấm tấm rau thơm, chiên tới màu đồng sậm.",
      history: "Tod mun pla (chả cá Thái) ra đời ở đồng bằng miền Trung Thái Lan, nơi sông rạch một thời cho mỗi thị trấn nhiều cá hơn sức người ăn. Người ta giã cá chung với sốt cà ri đỏ, lá chanh Thái xắt sợi và đậu que giòn, rồi múc từng muỗng thả vào chảo dầu, chiên tới khi rìa bánh phồng rộp lên. Cái độ dai bật ấy mới là dấu ấn đáng giá của một tay bếp chịu khó. Còn đồ chua dưa leo trộn đậu phộng, tức món ajat mát lạnh, mới là bạn đời trọn kiếp của nó: một miếng nóng, một miếng mát.",
    },
  },
  "crispy-spring-rolls": {
    description: "Vỏ cuốn tay giòn rôm rốp, cắn vào là tới ngay phần nhân thịt heo bằm & rau củ đậm đà.",
    story: {
      lede: "Một cuốn chả giò giòn tan có hộ chiếu — sinh ra ở tỉnh Phúc Kiến bên Trung Quốc, hoàn thiện trong bếp Thái.",
      history: "Chả giò theo chân những người Phúc Kiến và Triều Châu di cư mà đến Xiêm La, thuở đó còn là bánh popiah cuốn mềm, ăn để mừng mùa xuân sang. Rồi đầu bếp Thái làm đúng cái việc mà đầu bếp Thái vẫn làm: họ vặn lửa lên. Chiên thật già, lớp vỏ vỡ tan trên phần nhân thịt heo bằm, miến và rau củ. Po pia tod (chả giò chiên) bây giờ Thái không kém bất cứ món nào trên thực đơn này — tiếng giòn của miếng cắn đầu tiên ở Bangkok cũng y hệt như ở đây.",
    },
  },
  "vegetable-spring-rolls": {
    description: "Phiên bản nhà vườn — vẫn lớp vỏ giòn rôm rốp ấy, bên trong là rau củ xào ngọt.",
    story: {
      lede: "Phiên bản nhà vườn của một huyền thoại vỉa hè — vẫn lớp vỏ vỡ giòn ấy, bên trong là rau củ ngọt lành.",
      history: "Người Thái vẫn giữ những ngày ăn chay — buổi sáng lên chùa, những dịp làm phước, và lễ hội chay lớn mỗi độ thu về — nên cuốn chả giò đã tự thích nghi từ mấy đời trước. Bắp cải, cà rốt và miến chín mềm ngọt lịm bên trong lớp vỏ, nên cuốn này chẳng cần gì ngoài cái giòn của chính nó và một chén nước chấm chua ngọt thật dậy vị. Có người gọi vì nguyên tắc; phần đông gọi thêm lần nữa vì thương.",
    },
  },
  "calamari": {
    description: "Từng khoanh mực mềm trong lớp áo vàng mỏng — chiên nóng hổi, dọn ra là hết.",
    story: {
      lede: "Món ăn vặt cưng nhất của vùng Địa Trung Hải gặp chảo dầu Thái — khoanh mực mềm, lớp áo vàng mỏng, cắn một cái là đứt, không hề dai.",
      history: "Mực chiên đi vòng quanh thế giới, từ calamari fritti trên những bờ biển nước Ý cho tới pla muek tod (mực chiên) ở chợ đêm Bangkok, nơi con mực xuống chảo ngay trong tầm mắt của chiếc ghe vừa bắt được nó. Bản của chúng tôi đứng ở giữa: lớp áo mỏng tẩm gia vị kiểu Địa Trung Hải, chiên nhanh trên lửa lớn theo lối hàng quán vỉa hè để khoanh mực giữ được độ mềm. Một thị trấn biển nghe ra đúng là chỗ ở dành cho nó.",
    },
  },
  "shrimp-tempura": {
    description: "Lớp bột mỏng như ren, nhẹ tênh, ôm lấy con tôm ngọt giòn — vàng nhạt và giòn rụm.",
    story: {
      lede: "Một lớp bột nhẹ tênh mang tấm hộ chiếu 400 năm — người Bồ Đào Nha dạy, người Nhật hoàn thiện, người Thái đón nhận.",
      history: "Tempura khởi đầu từ những thương nhân và giáo sĩ Bồ Đào Nha ở Nagasaki hồi thế kỷ 16, họ chiên đồ biển trong những ngày ăn chay mà họ gọi là quattuor tempora. Đầu bếp Nhật mài giũa kỹ thuật ấy thành một tấm ren — bột pha lạnh buốt, khuấy thật sơ, thả vào dầu nóng chớp nhoáng để nó vỡ tan chứ không cứng giòn. Bếp Thái, vốn si mê chảo dầu từ đời nào, đã nhận nuôi món này từ lâu lắm rồi. Tôm ngọt và giòn; lớp bột mỏng như sương giá.",
    },
  },
  "fresh-spring-rolls": {
    description: "Gỏi cuốn bánh tráng mát lạnh với xà lách giòn, dưa leo, húng lủi & cà rốt — chấm nước sốt đậu phộng béo ngậy.",
    story: {
      lede: "Kẻ điềm tĩnh của bàn ăn — không chảo dầu, không tiếng giòn, chỉ là một cuốn tươi mát ăn như đang giấu một điều bí mật.",
      history: "Gỏi cuốn là câu trả lời của Đông Nam Á cho món xà lách mà bạn có thể cầm trên tay: bánh tráng căng quanh miến, rau thơm và rau củ mát lạnh. Nó đi ra từ cùng một dòng popiah đã sinh ra cuốn chả giò chiên — chỉ khác ở chỗ bản tươi này nhất quyết từ chối dầu. Cuốn của chúng tôi gói gà bằm và đậu hũ chung với xà lách giòn, dưa leo, cà rốt và húng quế: một nốt trầm mát lạnh đối lại cả bàn ăn đang cay.",
    },
  },
  "orange-chicken": {
    description: "Gà chiên giòn áo lớp sốt cam sánh bóng, chua ngọt rực rỡ.",
    story: {
      lede: "Gà chiên giòn rôm rốp khoác lớp sốt bóng loáng, sáng vị cam — món chiều lòng cả bàn và hợp với mọi thứ còn lại trên đó.",
      history: "Orange Chicken sinh ra ở Mỹ — một sáng chế của thập niên 1980, lớn lên từ thói quen lâu đời của người Hồ Nam là nấu với vỏ quýt khô — rồi nó bước lên thực đơn Thái ở Mỹ đúng theo cách nó đã bước vào lòng người Mỹ: giòn, chua ngọt, ăn rồi không dừng lại được. Bản của chúng tôi giữ lớp bột thật nhẹ, còn lớp sốt thì vừa sánh vừa tươi vị, trộn lúc còn nóng để cái giòn sống sót qua được nước sốt. Gọi cho tụi nhỏ, rồi ngồi nhìn người lớn thò đũa.",
    },
  },
  "fried-tofu": {
    description: "Đậu hũ chiên vàng, chấm tương ớt ngọt–đậu phộng.",
    story: {
      lede: "Từng miếng đậu hũ vàng ruộm, ngoài giòn trong mềm mịn như bánh flan, chấm với tương ớt ngọt–đậu phộng.",
      history: "Tao hu tod (đậu hũ chiên) là món ăn vặt vỉa hè Bangkok chuyên làm đổi ý những ai còn nghi ngờ đậu hũ: đậu hũ cứng chiên tới khi lớp ngoài vỡ giòn mà bên trong vẫn mềm mịn như bánh flan, rồi chấm vào chén tương ớt ngọt sánh đặc đậu phộng giã. Đây là một trong những món quà xưa nhất mà người Hoa để lại cho bếp Thái, và cũng là món giản dị nhất — không ướp, không áo bột, chỉ có dầu nóng và sự kiên nhẫn. Nhanh tới mức nó ra bàn trước khi cả nhà kịp quyết xong món chính.",
    },
  },
  "house-salad": {
    description: "Xà lách giòn, dưa leo & cà chua mát lạnh, nam việt quất sấy dẻo ngọt, rưới nước trộn Thái chua thanh dậy vị.",
    story: {
      lede: "Rau xanh quen thuộc, nước trộn thì Thái không lẫn vào đâu được — nhịp cầu lặng lẽ chúng tôi bắc giữa hai nền ẩm thực.",
      history: "Nhà hàng Thái nào ở xứ người rồi cũng tự nghĩ ra một dĩa xà lách của riêng mình; dĩa này là của chúng tôi. Rau thì California trăm phần trăm, nước trộn thì Thái Lan trăm phần trăm — đậm đà chiều sâu, chanh tươi rói, ngọt vừa đủ để nắm tay mấy trái nam việt quất sấy dẻo. Đây là dĩa chúng tôi đưa cho người bạn cứ khăng khăng rằng mình không ăn được đồ Thái. Tới miếng cuối cùng thì người bạn đó ăn được rồi.",
    },
  },
  "rib-eye-salad": {
    description: "Thịt bò rib-eye nướng xém cạnh, xắt lát còn ấm, đặt trên xà lách mát, củ cải, hành lá & húng lủi — chan nước trộn chua thanh, thơm rau Thái.",
    story: {
      lede: "Người Thái vốn không quen làm gỏi hiền lành — dĩa này ra bàn với thịt bò rib-eye nướng xém cạnh và một thứ nước trộn biết cắn lại.",
      history: "Yam nghĩa là trộn, và cả họ nhà yam chính là câu trả lời của người Thái cho món gỏi: phần nước trộn — chanh, nước mắm, ớt, thoáng một chút đường — quan trọng hơn bất cứ cọng rau nào. Yam nuea yang, món yam bò nướng, là thứ đầu bếp Thái thèm khi cần một dĩa gỏi ăn no như một bữa cơm. Chúng tôi xắt thịt bò rib-eye còn ấm hơi lửa, rải lên xà lách mát, củ cải, hành lá và húng lủi, để mỗi miếng gắp lên vừa nóng vừa mát cùng một lúc.",
    },
  },
  "som-tum-thai": {
    description: "Đu đủ xanh giòn giã tại chỗ cùng tôm khô — chua, ngọt & cay gói trong một tiếng giòn tươi rói.",
    story: {
      lede: "Giã trong cối đá theo từng phần gọi, y như từ thuở trái đu đủ mới đặt chân tới Xiêm La — chua, ngọt, mặn và cay gói trong một tiếng giòn tươi rói.",
      history: "Đu đủ vốn không phải cây bản địa của Thái Lan: thương nhân bán đảo Iberia mang nó từ châu Mỹ sang hồi những năm 1600, và tới năm 1693 thì đu đủ đã mọc khắp Xiêm La. Đầu bếp Lào và vùng Isaan (Đông Bắc Thái Lan) đem trái xanh giòn ấy nhập vào truyền thống gỏi giã cối vốn có từ lâu đời hơn nhiều của họ, và tam mak hoong (gỏi đu đủ giã) ra đời. Mãi tới giữa thế kỷ 20 nó mới chinh phục được Bangkok, theo chân những người lao động Isaan lên thành phố, bán trước cổng các sân đấu quyền Thái rồi càn quét cả nước. Som Tum Thai là bản của thủ đô — tôm khô, đậu phộng, ngọt hơn một chút, nhưng lửa thì vẫn nguyên.",
    },
  },
  "som-tum-black-crab": {
    description: "Bản sâu hơn — cua đen muối giáng thêm một cú mặn mòi, đậm đà.",
    story: {
      lede: "Bản som tum (gỏi đu đủ Thái) sâu hơn và xưa hơn — cua đen muối, đúng kiểu người vùng Đông Bắc vẫn ăn.",
      history: "Trước khi som tum dọn lên thành phố và học cách ăn nói lịch sự, nó được giã chung với cua đồng muối — nặng mùi hơn, mặn hơn, gần với bản gốc của người Lào hơn. Con cua ngâm muối tiết ra một chiều sâu đậm đà mà bản tôm khô không sao với tới được; khác nhau như tấm bưu thiếp chụp vùng Isaan với một chuyến đi thật tới đó. Gọi thêm một phần xôi và ăn theo lối Đông Bắc: chậm rãi, và bằng sự trân trọng.",
    },
  },
  "som-tum-fresh-shrimp": {
    description: "Tôm luộc ngọt thịt nằm trên cái nền giòn tươi rói, rực lửa ấy.",
    story: {
      lede: "Cánh cửa dịu dàng nhất để bước vào họ nhà som tum (gỏi đu đủ Thái) — tôm luộc ngọt thịt trên cùng ngọn lửa tươi rói ấy.",
      history: "Som tum xưa giờ vẫn là món của những gì sẵn có trong tay: cua đồng ở vùng Đông Bắc, tôm khô ở Bangkok, và hải sản tươi ở bất cứ nơi nào biển kề bên. Bản của chúng tôi nghiêng về phía biển — tôm luộc mập mạp nằm trên đu đủ giã cùng cà chua, đậu que, chanh và ớt, vị ngọt của tôm làm nguội bớt tính nóng của ớt vừa đủ. Ai mới làm quen, hãy bắt đầu từ đây. Còn ai quen rồi thì khỏi cần nói.",
    },
  },
  "larb": {
    description: "Thịt bằm còn ấm, hành tây tím & ớt bột trong nước trộn chua cay, thính gạo rang giã cho tiếng giòn thơm mùi khói.",
    story: {
      lede: "Món cầu may của vùng Isaan (Đông Bắc Thái Lan) — chữ “larb” nghe gần như chữ chỉ vận may trong tiếng Thái, và lễ lạt nào ở miền Đông Bắc cũng không thể thiếu nó.",
      history: "Larb (gỏi thịt bằm kiểu Isaan) theo dòng Mekong từ Lào xuôi về vùng Isaan (Đông Bắc Thái Lan) rồi trở thành món của đám cưới, của năm mới, của những ngày con cháu về nhà — cái tên nghe gần như chữ laap, nghĩa là vận may, nên ăn một miếng cũng coi như đã nhận được nửa lời chúc phúc. Thịt bằm còn ấm được trộn với chanh, nước mắm, ớt bột, húng lủi và khao khua: gạo sống rang khô trong chảo rồi giã nhỏ, chính cái giòn thơm mùi khói ấy mới làm cho larb ra larb. Theo lệ xưa, người được vinh dự trộn món này là chủ gia đình. Món của chúng tôi thì trộn trong bếp — nhưng vận may vẫn cứ truyền qua như thường.",
    },
  },
  "nam-tok-salad": {
    description: "Bò “thác đổ” — thịt bò rib-eye nướng, xắt lát mỏng mọng nước, trộn chanh, ớt, rau thơm Thái & thính gạo rang. Kèm một miếng bắp cải để dịu lửa.",
    story: {
      lede: "Bò “thác đổ” — cái tên đến từ tiếng xèo của nước thịt rơi xuống than hồng lúc miếng rib-eye đang nướng.",
      history: "Nam tok nghĩa là thác nước, mà chất thơ ở đây lại rất thực tế: thịt bò nướng trên than, nước thịt nhỏ giọt xuống và xèo lên giữa đám than hồng — chính âm thanh đó đặt tên cho món ăn. Là món nướng kinh điển của vùng Isaan (Đông Bắc Thái Lan), nó đem tất cả những gì larb đã biết — chanh, ớt, rau thơm, cái giòn của thính gạo rang — áp vào thịt bò xắt lát thay vì thịt bằm. Chúng tôi nướng rib-eye, xắt mỏng lúc miếng thịt còn ửng hồng, rồi kèm theo một miếng bắp cải để bạn dịu lửa giữa các miếng gắp.",
    },
  },
  "thai-sausage": {
    description: "Ba khúc xúc xích xay thô vừa lấy khỏi vỉ nướng — vỏ căng bật, ruột mọng nước. Cắn kèm gừng tươi, ớt, chanh & đậu phộng.",
    story: {
      lede: "Khúc xúc xích chua trứ danh của vùng Isaan (Đông Bắc Thái Lan) — mỗi tiếng cắn giòn là mấy ngày trời kiên nhẫn.",
      history: "Sai krok Isan là báu vật vỉa hè của miền Đông Bắc: thịt heo xay thô trộn cơm nếp, nêm tỏi, dồn bằng tay rồi để lên men cho tới khi men lactic tự nhiên đưa nó sang một vị chua dịu mà gây ghiền — chuyện của mấy ngày trời, không bao giờ chỉ vài tiếng. Bạn ngửi thấy mùi than trước khi kịp nhìn ra chiếc xe đẩy. Lệ xưa bắt buộc phải có đoàn tùy tùng đi kèm: bắp cải sống, gừng tươi, ớt hiểm và đậu phộng. Cứ cắn xen kẽ, để chua, cay và mát thay phiên nhau đổi chỗ.",
    },
  },
  "crying-tiger": {
    description: "Thịt bò rib-eye nướng xém lửa, chấm nước sốt thơm mùi khói của thính gạo rang–húng lủi–me — ngon tới mức con cọp phải khóc.",
    ingredients: [
      "Thịt bò rib-eye hạng Prime, nướng trên lửa trần cho tới khi mặt ngoài cháy xém đanh lại",
      "Nước chấm jaew: thính nếp rang giã (khao kua), nước mắm, chanh, ớt bột",
      "Húng lủi tươi, ngò rí, hành tím xắt lát",
      "Bắp cải nướng xắt miếng dọn kèm",
    ],
    pairing: {
      drink: "Một ly cà phê Thái đá thật đậm, hoặc một ly mezcal thoảng khói — cả hai đều bắt được vị lửa xém từ vỉ nướng.",
      sides: ["Sticky Rice", "Som Tum Thai", "Pink Milk cho tụi nhỏ"],
    },
    story: {
      lede: "Một miếng bò nướng mang cái tên sinh ra đủ thứ giả thuyết. Câu chuyện thật thì xưa hơn và lặng lẽ hơn truyền thuyết — những người nông dân vùng Đông Bắc (Isaan) đem các phần thịt bò dai ra nướng thật già, xắt mỏng như tờ giấy, rồi tiễn mùi khói ấy bằng một chén nước chấm chua cay tên là jaew.",
      history: "Suea Rong Hai (เสือร้องไห้) dịch sát nghĩa là “con cọp khóc”. Phần đông người ta kể lại phiên bản lãng mạn: miếng thịt ngon tới mức khiến một con cọp cũng phải rơi nước mắt. Câu chuyện Isaan xưa hơn thì ngược lại — phần thịt được dùng theo lệ cũ là một miếng gầu bò dai nhách, người ta gọi đó là phần “cọp khóc” vì tới cọp nhai cũng phải ứa nước mắt. Giã cho mềm, nướng cho thật già, rồi xắt lát mỏng ngang thớ — đó là cách gỡ của người trong làng. Đầu bếp vùng Đông Bắc Thái Lan ghép nó với jaew — chén nước chấm gồm thính gạo rang, chanh, nước mắm và một lượng ớt không hề đùa — rồi ăn chung với xôi và một chai lao khao. Bếp trưởng của chúng tôi học món này từ người cậu, người từng đứng quầy nướng bên đường ở ngoại ô Khon Kaen và sau khi qua California thì nhất quyết không đụng tới thứ gì khác ngoài rib-eye. “Nếu cháu kham nổi miếng rib-eye,” ông nói với chị, “thì con cọp hết khóc rồi.” Chúng tôi giữ đúng luật của ông.",
      howToEat: "Ăn theo lối Isaan: vê một viên xôi nhỏ giữa mấy đầu ngón tay, chấm nhẹ vào chén jaew, rồi dùng chính viên xôi đó gắp một lát thịt bò lên và bỏ trọn vào miệng trong một miếng. Đừng nhận viên xôi cho ngập nước chấm — xôi ở đây là cái muỗng, không phải miếng bọt biển. Giữa các miếng, cắn một miếng bắp cải là vị giác của bạn được trả về vạch xuất phát.",
      chefNote: "Cậu tôi nói phép thử của một dĩa Crying Tiger thật nằm ở khoảnh khắc ngay sau miếng đầu tiên — xôi, mùi khói, vị chanh, cái cay — chúng phải tới lần lượt từng thứ một, như một đoàn diễu hành nhỏ. Nếu chúng ập tới cùng lúc, người nấu đã vội. Nếu chỉ một thứ tới thôi, người nấu đã sợ lửa. Chúng tôi thì không sợ lửa.",
    },
  },
  "meat-ball-skewer": {
    description: "Xiên thịt viên heo kiểu Thái nướng, chấm tương ớt ngọt.",
    story: {
      lede: "Ba xiên thịt viên heo kiểu Thái dai bật, nướng xém trên vỉ than rồi quét một lớp tương ớt ngọt.",
      history: "Look chin ping là âm thanh của mọi chợ đêm Thái Lan — từng viên thịt xâu vào que tre, xoay đều trên than hồng, người bán phe phẩy một mảnh bìa các-tông cho lửa bén. Thịt viên Thái được làm cho dai bật là có chủ ý: thịt heo bị quết tới khi bật ngược trở lại, nên viên nào cắn vào cũng cắn lại bạn một cái rồi mới chịu mềm. Lửa nướng làm mặt ngoài rộp lên; còn chén tương ớt ngọt thì không phải chuyện tùy chọn. Cứ ăn ngay trên que.",
    },
  },
  "tom-yum": {
    description: "Món chua cay trứ danh — sả, riềng & lá chanh Thái bốc thơm trên nồi nước dùng đỏ ớt thả nấm rơm.",
    story: {
      lede: "Nồi nước lừng danh nhất của Thái Lan — thứ nước dùng chua cay đã dạy cả thế giới gọi tên sả và riềng.",
      history: "Tom nghĩa là nấu sôi; còn yam là cả một dòng họ lớn các món trộn chua cay của Thái Lan. Cuộc hôn phối ấy diễn ra ở vùng đồng bằng miền Trung Thái Lan chằng chịt sông rạch, nơi mẻ cá trong ngày gặp đúng những bụi sả, riềng và chanh Thái mọc dọc mọi bờ nước. Tom yum kung, phiên bản nấu tôm, lên ngôi cùng Bangkok thời Rattanakosin rồi trở thành tấm danh thiếp của cả xứ sở này với thế giới. Nồi của chúng tôi bốc khói cùng nấm rơm trong thứ nước dùng sáng rực màu ớt — trong veo, dữ dội, và hồi sức.",
    },
  },
  "tom-yum-seafood": {
    description: "Vẫn ngọn lửa trứ danh ấy, chất đầy báu vật của biển — nguyên nồi cho cả bàn.",
    story: {
      lede: "Ngọn lửa trứ danh ấy được đưa ra biển — một nồi chung chật kín hải sản.",
      history: "Dọc vịnh Thái Lan, tom yum chưa bao giờ là chuyện của mỗi một con tôm: người nấu bếp miền biển trút cả mẻ lưới vào nồi rồi để nước dùng lo phần giới thiệu. Đây chính là phiên bản đó — vẫn sả, riềng và chanh ấy, nhưng chất đầy theo kiểu cả nhà cùng ăn. Ở Thái Lan, một nồi nước bốc khói đặt giữa bàn chính là hình hài của một buổi tối đẹp. Gọi món này, buổi tối của bạn coi như đã bắt đầu.",
    },
  },
  "tom-kha": {
    description: "Nước cốt dừa mượt mà xoa dịu chua cay thành một thứ béo ngậy, thơm vị chanh & ngon tới mức nguy hiểm.",
    ingredients: [
      "Nước cốt dừa tươi và cốt dừa đặc",
      "Riềng (kha) — xắt lát dày, món canh này lấy tên từ nó",
      "Sả, lá chanh Thái, ớt Thái",
      "Nấm rơm, cà chua bi",
      "Nước cốt chanh, nước mắm, đường thốt nốt",
      "Chọn gà, tôm hoặc nấm",
    ],
    pairing: {
      drink: "Pink Milk hoặc một ly nước dừa ướp lạnh — cả hai đều giữ cái cay ở mức thân thiện mà không làm tê đi hương rau thơm.",
      sides: ["Jasmine Rice", "Fresh Spring Rolls", "Sticky Rice"],
    },
    story: {
      lede: "Người anh em hiền lành hơn của tom yum. Nước cốt dừa làm mềm cái cay của ớt; còn riềng — không phải gừng, tuyệt đối không phải gừng — mới là thứ mang lại mùi hương khiến căn bếp Thái nào cũng thơm như nhà mình.",
      history: "Tom kha gai (ต้มข่าไก่) là món canh thường ngày của miền Trung Thái Lan, rồi nổi tiếng khắp thế giới nhờ những nhà hàng Thái ở xứ người. Cái tên của nó đọc sao hiểu vậy: tom = nấu sôi, kha = riềng, gai = gà. Nguyên liệu làm nên linh hồn món này là củ riềng — một loại củ trông như anh em họ với gừng nhưng vị thì chẳng giống thứ gì khác: thoảng mùi nhựa thông, the vị chanh, và hơi ngai ngái mùi xà phòng theo cái cách dễ thương nhất. Gia đình bếp trưởng của chúng tôi nấu món này mỗi lần trong nhà có người cảm. “Nước cốt dừa để dỗ dành,” má chị vẫn nói vậy, “riềng để làm thuốc, còn chanh là để cho phần hồn.” Phần lớn thực đơn ở phương Tây nấu món này ngọt quá tay mà lại nhát tay bỏ ớt. Nồi của chúng tôi thì nằm gần bản nấu ở nhà hơn: tươi sáng, đủ cay để đánh thức bạn dậy, và thơm tới mức như một cái ôm.",
      howToEat: "Tom kha sinh ra là để ăn với cơm — chứ không phải để húp riêng như một món khai vị. Chan một ít nước dùng cùng vài miếng gà hoặc tôm lên một gò cơm trắng nho nhỏ, trộn nhẹ tay, rồi đưa trọn vào miệng trong một miếng. Mấy lát riềng trong tô không phải để nhai — chúng chỉ làm nhiệm vụ đưa hương, giống như lá nguyệt quế vậy. Cứ gạt chúng sang một bên. Nếu thấy cay quá, bạn châm thêm chút nước cốt dừa để riêng ra chén (cứ hỏi là chúng tôi mang ra); còn nếu thấy nhạt quá, hãy xin thêm dầu ớt nam prik pao của quán. Còn miếng chanh nằm trên mặt tô là của bạn, tùy bạn định lúc nào thì ra tay.",
      chefNote: "Hồi má tôi bệnh, má đòi tom kha trước cả khi đòi thuốc. Tôi nghĩ là vì muỗng nào cũng có vị của căn bếp tụi tôi lớn lên trong đó — vẫn nước cốt dừa ấy, vẫn củ riềng ấy, vẫn miếng chanh vắt vào tô đúng vào giây cuối cùng. Bây giờ ở California tôi vẫn nấu y hệt như vậy. Riềng ở đây khó kiếm hơn, nhưng tôi không thay bằng thứ gì khác. Phải là kha mới được.",
    },
  },
  "tom-kha-seafood": {
    description: "Nước dùng chua cay béo ngậy nước cốt dừa, chật kín hải sản — nguyên nồi cho cả bàn.",
    story: {
      lede: "Thứ nước dùng mượt mà nhất quán gặp mẻ hải sản trong ngày — nước cốt dừa, riềng và cả biển khơi trong cùng một nồi.",
      history: "Tom kha nổi danh với tư cách một món canh gà, nhưng bếp miền biển Thái Lan thì xưa giờ vẫn biết nước cốt dừa làm được gì cho hải sản: làm mềm, làm tròn, làm tôn lên. Củ riềng thì không có chuyện thương lượng — nó chính là chữ kha trong cái tên — và miếng chanh vẫn vắt vào đúng giây cuối cùng. Dọn ra giữa bàn theo lối Thái: đủ béo cho người còn dè dặt, đủ thơm cho người đã trót mê.",
    },
  },
  "po-tak-seafood": {
    description: "“Nò cá vỡ toang” — nước dùng chua cay trong veo, rực lửa, chật kín hải sản & rau thơm Thái. Nguyên nồi.",
    story: {
      lede: "“Nò cá vỡ toang” — một nồi canh mang giọng khoác lác của dân chài, chất nhiều tới mức ngư cụ cũng chịu không nổi.",
      history: "Po là cái nò cá đóng cọc mà dân chài ven biển Thái Lan đã cắm nơi vùng nước cạn từ bao nhiêu đời nay; còn taek nghĩa là vỡ. Po taek là nồi canh dành cho cái ngày mẻ cá nhiều hơn sức chứa của ngư cụ — tất cả đổ hết vào một nồi nước dùng trong veo, rực lửa với sả, riềng và húng quế, và không có lấy một giọt nước cốt dừa nào để đỡ đòn. Người anh em gầy hơn, mặn mòi hơn của tom yum: thuần biển, thuần rau thơm, thuần cay.",
    },
  },
  "wonton-soup": {
    description: "Hoành thánh nhân thịt heo & tôm mượt mềm trong nước dùng trong thanh, giá & hành lá — món hiền lành nhất trên bàn.",
    story: {
      lede: "Món hiền lành nhất trên bàn — những gói hoành thánh mượt mềm trong nước dùng trong thanh, món quà từ khu phố người Hoa của Bangkok.",
      history: "Hoành thánh theo tàu tới Xiêm La cùng những người Quảng Đông và Triều Châu di cư, mà mấy tiệm mì của họ đã biến con đường Yaowarat ở Bangkok thành một trong những con phố ăn uống lừng danh nhất châu Á — cái tên trong tiếng Quảng vẫn được truyền tụng là mang nghĩa “nuốt mây”. Đầu bếp Thái giữ cho nước dùng trong trẻo và thật thà, thêm giá và hành lá, rồi biến kiao nam thành món mà một gia đình Thái sẽ gọi cho tụi nhỏ, cho ông bà, và cho bất cứ ai đang cần được chăm sóc.",
    },
  },
  "panang-curry": {
    description: "Sốt panang sánh đặc, ngọt mặn đậm đà, ôm lấy từng miếng trong cốt dừa đặc, ớt chuông đỏ & húng quế.",
    story: {
      lede: "Món cà ri nhung — sánh hơn, trầm hơn và béo hơn người anh em cà ri đỏ, đã có mặt trong sách nấu ăn Thái từ năm 1889.",
      history: "Phanaeng xuất hiện trên sách báo Thái từ sớm nhất là năm 1889, khi đó đã ngồi rất tự nhiên trên mâm cơm thời Rattanakosin. Cái tên của nó là một bí ẩn vui vẻ — người thì nghe ra chữ panggang trong tiếng Mã Lai, nghĩa là nướng; người lại nghe ra tên hòn đảo Penang; người khác thì quả quyết nó Thái tới tận xương. Chỉ có tính cách của nó là chắc chắn: nhiều cốt dừa đặc hơn, ít ớt hơn, đậu phộng được giã lẫn vào sốt cà ri, rồi riu lửa cho tới khi lớp dầu nổi lên và nước sốt bám lấy miếng thịt như nhung. Chúng tôi hoàn thiện nó bằng ớt chuông đỏ và húng quế.",
    },
  },
  "yellow-curry": {
    description: "Vàng óng, hiền lành & ấm lòng — gà hầm mềm và khoai tây bở trong nồi cà ri béo ngậy, ấm mùi nghệ.",
    story: {
      lede: "Món vàng óng và hiền lành — nơi con đường gia vị Ấn Độ gặp cốt dừa đặc của người Thái.",
      history: "Kaeng kari là những gì mà mấy thế kỷ giao thương trên Ấn Độ Dương để lại trong nồi của người Thái: nghệ, thì là Ai Cập và hạt ngò, theo gió mùa mà tới, rồi được các căn bếp Thái theo đạo Hồi hòa vào nước cốt dừa cho tới khi tất cả tròn vị và ấm lòng. Gà hầm mềm, khoai tây bở, hành tây ngọt. Đây là món cà ri mà cha mẹ người Thái gọi cho con mình — và cũng là món mà người Thái xa xứ gọi cho chính mình mỗi khi nhớ nhà.",
    },
  },
  "green-curry": {
    description: "Xanh màu rau thơm & dậy hương — bí ngòi, cà tím, ớt chuông & húng quế trong nồi cà ri nước cốt dừa tươi rói.",
    story: {
      lede: "Món cà ri “xanh ngọt” — cái tên nói về màu sắc chứ không phải về đường — và tuổi đời vừa mới chạm tới một thế kỷ.",
      history: "Kaeng khiao wan là một món kinh điển còn trẻ, được ghi chép lần đầu trong khoảng từ 1908 đến 1926, vào cuối thời hoàng gia Xiêm La. Cái tên này đánh lừa người dịch: chữ wan, nghĩa là ngọt, nói về cái sắc xanh nhạt ngả màu kem mà người Thái gọi là “xanh ngọt” — chứ không nói về vị, vốn còn cay hơn cả cà ri đỏ. Ớt hiểm xanh tươi cho phần sốt cà ri cả màu sắc lẫn tính khí; rồi nước cốt dừa, cà tím, bí ngòi và húng quế bo tròn nó lại thành một trong những món cà ri được yêu nhất trên đời.",
    },
  },
  "panang-dino-rib": {
    description: "Sườn bò (dino rib) hầm mềm trong nồi cà ri panang sánh đặc, béo ngậy.",
    story: {
      lede: "Nguyên một dẻ sườn bò (dino rib) hầm mềm nằm dưới lớp panang sánh đặc, béo ngậy của chúng tôi — món cà ri mà người ta chịu khó chạy xe qua nửa thành phố để ăn, nay được ghép cho một miếng sườn xứng tầm.",
      history: "Panang là gã quý tộc hiền lành trong họ nhà cà ri Thái — sánh hơn và ngọt hơn cà ri đỏ, ướp hương lá chanh Thái, sinh ra để bám lấy miếng thịt chứ không phải để đọng thành vũng quanh nó. Xưa giờ nó luôn hay nhất khi đi cùng những phần thịt hầm chậm, mà sườn dino rib thì là phần chậm nhất trong tất cả: nguyên một dẻ sườn bò còn nguyên xương, hầm tới khi thịt chịu buông ra chỉ với một cái nĩa. Ở đây, miếng sườn thay chỗ cho phần thịt xắt lát thường thấy — một dĩa, một dẻ sườn, và cả một lượng nước sốt đáng để bạn vét tới cùng.",
    },
  },
  "house-fried-rice": {
    description: "Cơm gạo đỏ xào chảo lửa với trứng & hành lá, dọn kèm dưa leo mát lạnh.",
    story: {
      lede: "Màn hai vĩ đại nhất thế gian — hạt cơm khiêm nhường, tái sinh bóng lưỡng trong một chiếc chảo đang gào lửa.",
      history: "Cơm chiên theo chân những người Hoa di cư mà xuôi về phương Nam, rồi gặp đúng tri kỷ đời mình trong hạt gạo thơm của Thái Lan — khô hơn, dậy hương hơn, sinh ra là để dành cho chiếc chảo. Khao pad (cơm chiên Thái) trở thành niềm an ủi chung của cả nước: tiệm cơm nào cũng bán, bà ngoại nào cũng nấu được, cơn thèm nửa khuya nào cũng gọi tên. Bản của chúng tôi xào gạo đỏ với trứng và hành lá cho tới khi từng hạt cơm lên bóng, dọn kèm mấy lát dưa leo mát lạnh — dấu chấm câu quen thuộc của người Thái.",
    },
  },
  "spicy-basil-fried-rice": {
    description: "Lửa cay của Krapow, cái ấm lòng của cơm chiên — ớt, tỏi & húng quế trong từng muỗng.",
    story: {
      lede: "Hai huyền thoại Thái trong cùng một chiếc chảo — ngọn lửa krapow xào quyện vào cái ấm lòng của cơm chiên.",
      history: "Khi pad kaphrao trở thành bữa trưa mặc định của cả nước Thái, phiên bản cơm chiên nối gót theo sau chắc chắn như buổi trưa nối gót buổi sáng: vẫn ớt đó, tỏi đó, húng quế đó, chỉ khác là giờ chúng được những hạt cơm đã tự mình đi qua lửa mang trên lưng. Đó là lối tính toán của mấy tiệm cơm — một cái chảo, hai cơn thèm, không nhân nhượng chút nào. Úp thêm cái trứng ốp la lên mặt là bạn đang ăn y hệt một người khách ruột ở Bangkok.",
    },
  },
  "pineapple-fried-rice": {
    description: "Thơm (khóm) ngọt lịm, nho khô, cà chua & hạt điều đảo đều trong cơm chiên trứng — ngọt mặn quyện nhau, ăn là ghiền.",
    story: {
      lede: "Dĩa cơm của ngày vui — thơm ngọt, nho khô và hạt điều đảo cùng những hạt cơm vương trứng.",
      history: "Khao pad sapparot (cơm chiên thơm) là dĩa cơm chiên Thái khi diện áo dạ hội — nổi tiếng với cách dọn trong nguyên trái thơm khoét ruột mỗi khi nhà có chuyện đáng mừng. Ý tưởng ấy đến từ một lẽ khôn ngoan xưa của người Thái: trái cây có chỗ đứng đàng hoàng trong món mặn, và cái chua ngọt của trái thơm đánh thức dĩa cơm chiên y như miếng chanh đánh thức tô cà ri. Nho khô, cà chua và hạt điều béo ngậy khép lại một dĩa cơm đã thuyết phục được nhiều người hoài nghi hơn bất cứ món nào chúng tôi từng biết.",
    },
  },
  "narwhal-garlic-beef": {
    description: "Cơm chiên đặc sản của quán — thịt bò áp chảo cùng một lượng tỏi vàng hào phóng tới mức lộng lẫy, từng hạt cơm bóng lưỡng & đậm đà.",
    story: {
      lede: "Dĩa cơm của nhà, luật của nhà: trên đời này không có chuyện nhiều tỏi vàng quá tay.",
      history: "Món này thì Narwhal từ đầu tới cuối. Hồi còn thử công thức, bếp trưởng của chúng tôi cứ nhân đôi phần tỏi phi trên dĩa cơm chiên bò, chỉ để coi thử tới đâu thì dừng — vậy mà dĩa nào bưng ra cũng quay về sạch trơn. Bản cuối cùng áp chảo miếng thịt bò thật già lửa, đảo quyện vào cơm trứng bóng lưỡng, rồi phủ lên trên cả một trận lở tỏi phi đúng tới cái giây nó chuyển vàng và dậy ngọt. Món này chưa từng có ở Thái Lan. Nó chỉ có thể ra đời ở đây — và chúng tôi cũng hơi tự hào vì chuyện đó.",
    },
  },
  "crab-fried-rice": {
    description: "Thịt cua ngọt lịm đảo cùng cơm vương trứng — nhẹ nhàng, thanh tao, tươi vị biển.",
    story: {
      lede: "Món mà dân sành đồ Thái vẫn dùng để chấm điểm một căn bếp — ở đây không có chỗ nào để giấu.",
      history: "Khao pad pu (cơm chiên cua) là dòng dõi quý tộc của mấy tiệm cơm Bangkok: thịt cua ngọt đảo cùng cơm vương trứng, nêm nhẹ tới mức chỉ còn tay nghề đứng chảo giữ cho cả dĩa đứng vững. Những đầu bếp gốc Hoa ở Thái đã biến nó thành bài kiểm tra thầm lặng dành cho một căn bếp — chan nhiều nước sốt quá là đang giấu chuyện gì đó; lửa non quá thì hạt cơm đục màu. Bản của chúng tôi giữ nguyên sự thanh tao và vị biển tươi rói. Vắt một miếng chanh, ăn một muỗng, rồi bạn sẽ biết hết về chúng tôi.",
    },
  },
  "garlic-pepper-over-rice": {
    description: "Tỏi vàng & tiêu giã dập rưới trên cơm trắng — giản dị, đậm đà, làm tới nơi tới chốn.",
    story: {
      lede: "Ký ức vị giác xưa nhất của người Thái — tỏi và tiêu trắng, cái cay có trước cả trái ớt.",
      history: "Mãi tới những năm 1600, trái ớt mới theo những con tàu Bồ Đào Nha mà cập bến Xiêm La. Trước đó, cái cay của người Thái là tiêu trắng với tỏi — và pad kratiem prik thai (xào tỏi tiêu) vẫn đang giữ ngọn lửa xưa ấy cháy tới hôm nay. Tỏi vàng, tiêu giã dập và một lớp sốt sánh đậm đà rưới lên cơm trắng: đúng cái vị của bếp Thái thuở châu Mỹ còn chưa bước vào, mà tới giờ ngày nào cũng có người gọi, chỉ vì họ muốn bữa trưa của mình có cảm giác được ai đó chăm nom.",
    },
  },
  "krapow-over-rice": {
    description: "Huyền thoại bữa trưa của nước Thái — ớt cay xé & húng quế thơm nồng trên cơm trắng.",
    story: {
      lede: "Huyền thoại bữa trưa của nước Thái — món người Thái gọi khi không biết nên gọi món gì.",
      history: "Pad kaphrao ra đời vào thập niên 1920 và 1930, khi kỹ thuật đứng chảo của người Hoa gặp bai kaphrao — thứ húng quế Thái dậy mùi tiêu và phảng phất hương đinh hương mà người Thái đã trồng suốt mấy trăm năm — rồi sau thập niên 1950 thì nó càn quét cả nước. Ngày nay đây là bữa trưa quốc dân không cần ai phong, phổ biến tới mức krapow là câu trả lời có sẵn cho câu hỏi “bữa nay ăn gì?”. Chảo gào lửa, ớt, tỏi, húng quế, cơm. Nhớ kêu thêm cái trứng ốp la rìa giòn; ai cũng kêu.",
    },
  },
  "og-pad-thai": {
    description: "Bánh phở dai mềm áo sốt me ngọt dịu, giá & hẹ — chanh cho bật vị, đậu phộng cho giòn.",
    ingredients: [
      "Bánh phở chantaboon cắt tay (jantaboon)",
      "Nước me cốt nhà nấu, đường thốt nốt, nước mắm",
      "Đậu hũ ép, tôm khô, củ cải muối (chai poh)",
      "Hẹ tươi, giá, bắp chuối",
      "Đậu phộng rang, miếng chanh, ớt khô xay",
      "Chọn gà, tôm, đậu hũ, hoặc không kèm đạm",
    ],
    pairing: {
      drink: "Trà Thái đá (như trong hình) hoặc một ly bia lager thanh nhẹ — cả hai đều cắt bớt vị ngọt của me mà không tranh phần với món ăn.",
      sides: ["House Iced Tea", "Fresh Cucumber Cooler", "Crispy Spring Rolls"],
    },
    story: {
      lede: "Dĩa Pad Thai khởi đi từ những căn bếp Bangkok thập niên 1940, chứ không phải bản Mỹ hóa chan tương cà. Ngọt từ đường thốt nốt, chua từ me, mặn từ nước mắm, thơm mùi khói từ một chiếc chảo đủ nóng — vậy thôi, hết.",
      history: "Pad Thai trẻ hơn nhiều so với người ta vẫn tưởng. Món này được Thống chế Plaek Phibunsongkhram phổ biến rộng rãi vào thập niên 1940, trong khuôn khổ một chiến dịch xây dựng bản sắc dân tộc — thời chiến gạo khan hiếm, mà sợi bánh phở thì ngốn ít lúa gạo hơn, nên công thức lan từ những cuốn sách dạy nấu ăn do nhà nước phát hành ra khắp mọi xóm mọi phường. Bếp trưởng của chúng tôi học món này từ bà ngoại của chị ở Bangkok, mà bà thì học lại từ một người bán mì ở tỉnh Chantaburi (quê hương của sợi bánh phở chantaboon) hồi thập niên 1960. Chữ “OG” trong tên món là cái nháy mắt của bếp trưởng trước chuyện dĩa Pad Thai ngày nay đã trôi xa bản gốc này đến mức nào — không tương cà, không bơ đậu phộng, không thứ nước sốt hồng ngọt lịm nào hết. Chỉ còn lại thế cân bằng bốn vị mà đầu bếp Thái nào cũng đuổi theo cả đời: เปรี้ยว หวาน เค็ม เผ็ด — chua, ngọt, mặn, cay.",
      howToEat: "Một dĩa Pad Thai đàng hoàng bao giờ cũng ra bàn kèm một miếng chanh, ít giá sống, một nhúm ớt khô xay, và đôi khi có thêm bắp chuối sống để riêng bên cạnh. Việc đầu tiên: vắt miếng chanh lên khắp dĩa. Rồi nếm thử — thấy còn thiếu lửa thì rắc thêm ớt; thấy thiếu độ giòn thì cứ chất giá lên cho đầy. Mấy thứ rau thơm và đồ ăn kèm đó không phải để trang trí; đó là chỗ ngồi của bạn ngay tại bàn của người nấu. Ý nghĩa của cả món nằm ở chỗ: phần nêm nếm sau cùng là do chính cái lưỡi của bạn quyết định.",
      chefNote: "Bà ngoại tôi dặn: nếu dĩa Pad Thai của con có vị như tương cà, thì con vừa mua nhằm một dĩa dành cho khách du lịch. Pad Thai thiệt thì chua trước, rồi mới tới ngọt, rồi tới mặn, và sau cùng ớt mới lẻn vào. Mùi khói bốc lên từ chảo là vị thứ năm — mà muốn có nó thì phải có lửa thiệt. Ở đây dĩa nào chúng tôi cũng nấu trên bếp 200.000 BTU, bởi vì yếu hơn chừng đó thì chỉ là một dĩa đồ xào, chứ không phải Pad Thai.",
    },
  },
  "pad-see-ew": {
    description: "Bánh phở sợi to áp lửa chảo cho ngọt thơm mùi khói, cải rổ & trứng.",
    story: {
      lede: "Dĩa bánh phở xào ấm lòng, thơm mùi khói ngọt — mấy cạnh sợi cháy xém mới chính là linh hồn của món.",
      history: "Pad see ew, nghĩa là “xào với nước tương”, là nhánh Thái Lan của một đại gia đình mì sợi trải dài từ món chow fun Quảng Đông cho tới char kway teow của Singapore — bén rễ ở bất cứ nơi nào có đầu bếp Hoa mang theo cái chảo của mình. Bánh phở sợi to gặp nước tương đen, trứng và cải rổ (cải làn) trong một chiếc chảo gào lửa; đường cháy xém lại còn sợi bánh thì phồng rộp lên. Chính cái đắng nhẹ thoảng mùi khói ấy — thứ người ta gọi là hơi thở của chiếc chảo — mới phân biệt được hàng thiệt với một dĩa xào thường. Chảo của chúng tôi làm sợi bánh phồng rộp đúng nghĩa.",
    },
  },
  "pad-kee-mao": {
    description: "Ra lò từ chiếc chảo nóng gào lửa — ớt Thái, ớt chuông & húng quế. Cay tới nơi tới chốn, không đùa.",
    story: {
      lede: "Drunken Noodles (mì của kẻ say) — trong chảo chẳng có giọt rượu nào, sau cái tên là ba truyền thuyết, và trước mặt bạn là một độ cay rất nghiêm túc.",
      history: "Chẳng ai thống nhất được vì sao pad kee mao lại có nghĩa là mì của kẻ say. Có người nói đó là dĩa mì quăng đại vào chảo sau một đêm dài, với bất cứ thứ gì căn bếp còn sót lại; có người nói ớt được nêm mạnh tay như vậy là để xuyên qua một cái lưỡi đã tê. Lại có chuyện kể rằng một bà vợ đã nêm bữa tối của chồng cay lên thành một bài học nhớ đời. Nhưng ai cũng đồng ý về thang thuốc: bánh phở sợi to, một chiếc chảo nổi cơn, ớt Thái và húng quế. Chúng tôi nấu nó cay tới nơi tới chốn, không đùa.",
    },
  },
  "thai-boat-noodles": {
    description: "Nước lèo bò hầm chậm, sậm màu & dậy mùi thảo mộc — thịt bò cục mềm rục, bò viên, cải rổ & giá.",
    story: {
      lede: "Một tô nước lèo cõng trên mình cả trăm năm sông nước — ngày trước được múc ra từ những căn bếp nổi trên kinh rạch Xiêm La.",
      history: "Trước khi nước Thái có xa lộ thì đã có kinh rạch, và trước khi có mấy khu ăn uống thì đã có boat noodles (mì ghe): người bán chèo ghe dọc những con khlong, giữa khoang đặt một nồi than cân thật khéo, múc thứ nước lèo bò sậm màu, thấm đẫm thảo mộc vào từng cái tô nhỏ — tô nhỏ, để khi con sóng của chiếc ghe khác trờ qua thì không sánh ra ngoài. Mấy con kinh Rangsit gần Bangkok đã làm nên tên tuổi cho món này; rồi đường sá dần đưa những chiếc ghe lên cạn, nhưng tô mì thì sống sót. Bản của chúng tôi tri ân điều đó bằng nước lèo hầm chậm, thịt bò cục, bò viên và rau xanh.",
    },
  },
  "rad-na": {
    description: "Bánh phở sợi to xém lửa chảo nằm dưới lớp sốt sánh mịn dậy vị tiêu, thêm cải rổ — sự ấm lòng múc ra từng vá.",
    story: {
      lede: "Sự ấm lòng múc ra từng vá — sợi bánh phở xém lửa chảo nằm dưới lớp sốt sánh mịn dậy vị tiêu, món quà người Triều Châu để lại cho Bangkok.",
      history: "Rad na — đại khái nghĩa là “chan lên trên” — theo chân những người Triều Châu di cư từ vùng duyên hải Triều Sán bên Trung Quốc mà tới, và chính mấy tiệm ăn của họ đã dạy cho Bangkok biết cái thú của nước sốt sánh. Sợi bánh phở bản lớn được áp lửa cho xém thơm mùi khói trước, rồi mới đắp lên một lớp sốt nấu trên nền tương đậu nành lên men, sánh mịn như lụa và điểm những cọng cải rổ. Đây là món của ngày mưa trứ danh xứ Thái: món bạn gọi khi muốn bữa tối có cảm giác như một tấm chăn ấm.",
    },
  },
  "chow-mein": {
    description: "Sợi mì yakisoba dai bật đảo cùng trứng, bắp cải, cần tây & cà rốt.",
    story: {
      lede: "Kẻ lữ hành gốc Quảng Đông đã an cư ở mọi hải cảng trên trái đất này — sợi mì dai bật, chảo nóng già, và không hề có biên giới.",
      history: "Chow mein chỉ đơn giản có nghĩa là “mì xào”, vậy mà hiếm có món nào đi xa được đến thế chỉ với hai chữ. Hơn một thế kỷ trước, những đầu bếp Quảng Đông mang nó vượt Thái Bình Dương, và nó bén rễ ở bất cứ nơi nào nó đặt chân xuống — văn hóa chảo lửa của người Thái đón nhận nó mà chẳng cần nghĩ tới lần thứ hai. Bản của chúng tôi đảo sợi mì kiểu yakisoba dai bật cùng trứng, bắp cải, cần tây và cà rốt: một món ăn của ngã tư đường, dọn trên một cái bàn cũng là ngã tư đường.",
    },
  },
  "spaghetti-kee-mao": {
    description: "Drunken Noodles đi lạc qua nước Ý — spaghetti quăng vào chảo nóng gào lửa, ớt Thái, ớt chuông & húng quế.",
    story: {
      lede: "Cú bẻ lái kiểu Ý mà Bangkok mê nhất — sợi spaghetti bỏ nhà đi theo chiếc chảo.",
      history: "Người Thái phải lòng spaghetti từ mấy chục năm trước, rồi làm một chuyện mà nước Ý chưa bao giờ cho phép: quăng nó vào chiếc chảo đang bốc lửa cùng ớt, tỏi và húng quế. Spaghetti kee mao giờ đây là một món kinh điển hiện đại được cưng chiều khắp Bangkok — sợi mì al dente hứng trọn ngọn lửa của drunken noodles một cách đẹp đẽ, vẫn giữ nguyên độ dai qua lớp cháy xém. Bếp của chúng tôi nấu nó Thái tới bến, không xin lỗi ai hết. Ở đâu đó có một bà nội người Ý đang cau mày; và ở đâu đó có một bà nội người Thái đang nháy mắt.",
    },
  },
  "spaghetti-tom-yum": {
    description: "Spaghetti al dente đảo trong thứ vị chua cay trứ danh — sốt ớt Thái, sả, lá chanh Thái & riềng.",
    story: {
      lede: "Nồi nước lèo trứ danh hóa thành nước sốt — sả, lá chanh Thái và sốt ớt Thái bám riết lấy từng sợi mì.",
      history: "Một khi đầu bếp Thái đã biết sợi spaghetti sống sót được trong chảo, thì câu hỏi kế tiếp là điều không thể tránh khỏi: liệu nó có gánh nổi Tom Yum không? Dĩa mì này chính là câu trả lời — sốt ớt Thái, sả, lá chanh Thái và riềng, tất cả được cô lại từ nồi súp trứ danh nhất nước Thái thành một lớp áo bóng lưỡng khoác lên sợi mì al dente. Đó là bếp Thái hiện đại lúc tự tin nhất: những hương vị quốc bảo đặt trên một bộ xương sống mượn của người Ý. Bếp thử nghiệm của chúng tôi đã nhất quyết không chịu buông món này ra.",
    },
  },
  "thai-boat-noodles-dino-rib": {
    description: "Nước lèo boat noodles (hủ tiếu thuyền) đậm đà, dậy hương thảo mộc, ăn cùng sườn bò (dino rib) hầm rục.",
    story: {
      lede: "Nồi nước lèo boat noodles sẫm màu, thơm nồng thảo mộc của chúng tôi — và nguyên một miếng sườn bò (dino rib) hầm rục nằm vắt ngang tô.",
      history: "Boat noodles sinh ra trên những con kênh Bangkok, được múc từ ghe chèo vào những cái tô nhỏ xíu để không có gì sóng sánh đổ ra trên quãng ngắn từ ghe lên bờ — một thứ nước lèo sẫm màu, dậy hương thảo mộc, ninh riu riu hàng giờ mà tới nay người Thái vẫn còn cãi nhau từng tô một. Ghe lên bờ rồi thì cái tô lớn dần; tô này còn lớn thêm một bậc nữa. Thay cho mấy lát bò và viên bò quen thuộc là một miếng sườn bò (dino rib): nguyên khối sườn hầm mấy tiếng đồng hồ cho tới khi thịt tự rời khỏi xương mà rơi xuống nước lèo. Phần còn lại, cứ để nước lèo lo.",
    },
  },
  "garlic-pepper-alacarte": {
    description: "Tỏi phi vàng ruộm & tiêu trắng đập giập, xào lửa lớn cho dậy vị mặn mà.",
    story: {
      lede: "Bậc lão làng của họ nhà món xào Thái — tỏi và tiêu trắng, giữ vững trận địa từ thuở trái ớt còn chưa đặt chân tới Xiêm La.",
      history: "Pad kratiem prik thai (xào tỏi tiêu) dựng lên từ bộ ba khai quốc của bếp Thái: tỏi, tiêu trắng và rễ ngò, giã chung với nhau từ rất lâu trước khi thương nhân Bồ Đào Nha mang trái ớt tới hồi những năm 1600. Thứ hỗn hợp giã cổ xưa ấy tới giờ vẫn nằm dưới nền của phân nửa món ăn Thái; ở dĩa này, nó bước hẳn ra sân khấu và diễn một mình, xào tới vàng ruộm và đậm đà. Giản dị, xưa cũ, và đúng y như phải vậy.",
    },
  },
  "spicy-basil-alacarte": {
    description: "Bản krapow kinh điển — ớt & húng quế Thái, ồn ào & thơm nức.",
    story: {
      lede: "Bản krapow kinh điển dọn theo lối thuần túy nhất — bao nhiêu lửa dồn hết vào cái chảo.",
      history: "Ra đời hồi thập niên 1920, khi kỹ thuật chảo lửa của người Hoa gặp gỡ thứ húng quế linh thiêng của người Thái, pad kaphrao lớn lên thành món gọi mặc định của cả nước — món trả lời giùm mọi bữa trưa còn đang phân vân. Đây là bản à la carte dành cho bàn nào muốn đúng cái huyền thoại ấy: ớt, tỏi, phần thịt bạn chọn và cả một cơn bão lá kaphrao (húng quế Thái) thứ thiệt, ồn ào và thơm nức. Cái trứng ốp la thì tùy bạn, nhưng lịch sử xưa nay vẫn luôn khuyến khích.",
    },
  },
  "spicy-basil-eggplant": {
    description: "Bản krapow kinh điển trên nền cà tím xém chảo, mềm mượt.",
    story: {
      lede: "Đem phép krapow thi triển lên đứa học trò giỏi nhất của nó — trái cà tím xém lửa thì mềm mượt ra, lại còn uống cạn nước sốt.",
      history: "Cà tím dài là thiên tài thầm lặng của cái chảo Thái: xém lửa rồi thì ruột mềm mịn như bánh flan, giữ lấy nước sốt ớt và húng quế y như miếng bánh mì giữ bơ. Đem nó ghép với ngọn lửa của krapow là món kinh điển của dân mê rau khắp nước Thái — bằng chứng rằng món này chưa bao giờ cần tới thịt mới được thương. Vẫn ngọn lửa gầm ấy, vẫn cái kết bằng húng quế Thái ấy. Phần còn lại, trái cà tím lo hết.",
    },
  },
  "spicy-basil-dino-rib": {
    description: "Sườn bò (dino rib) hầm rục đem xào với húng quế Thái, tỏi & ớt.",
    story: {
      lede: "Phép krapow thi triển lên nguyên một miếng sườn bò (dino rib) hầm rục — lửa, tỏi, ớt và cả một cơn bão húng quế Thái.",
      history: "Pad kaphrao sinh ra vốn là để dành cho thịt xắt nhanh tay và một cái chảo thật nóng; dĩa này cố tình kéo chậm lại một nửa của phương trình đó. Miếng sườn bò (dino rib) — nguyên khối sườn bò còn nguyên xương — được hầm lửa liu riu suốt mấy tiếng cho tới khi đầu nĩa chạm vào là thịt rời ra, rồi mới đưa vào chảo hoàn tất cùng tỏi, ớt hiểm và lá húng quế Thái thứ thiệt, để nước sốt áp thẳng vào mặt thịt chứ không nằm bên dưới. Đây là món dành cho bàn nào muốn krapow thật ồn ào, và muốn chia nhau cùng ăn.",
    },
  },
  "chinese-broccoli": {
    description: "Rau cải cọng giòn xào lửa lớn với tỏi & dầu hào.",
    story: {
      lede: "Cải rổ (cải làn), tỏi, dầu hào, lửa — bốn thứ đã dựng nên phân nửa nền ẩm thực Thái gốc Hoa.",
      history: "Pad khana (cải rổ xào) là chuyện xảy ra khi không ai nghĩ ngợi quá nhiều về một cọng rau. Cải rổ theo chân những người đầu bếp di cư đã vẽ lại bộ mặt ẩm thực Bangkok cách đây một thế kỷ mà tới, rồi người Thái mê đắm cái cọng giòn rôm cùng vị khoáng hơi chát của nó. Xào chớp nhoáng trên lửa lớn với tỏi và dầu hào, đây là dĩa rau tiêu chuẩn từ hàng quán vỉa hè cho tới bàn tiệc — và cũng là dĩa mà đầu bếp Thái gọi ra để thử xem một căn bếp có biết tôn trọng rau hay không.",
    },
  },
  "american-broccoli": {
    description: "Bông cải xanh mềm ngọt trong lớp sốt sánh mượt.",
    story: {
      lede: "Người anh em họ bên Mỹ, được cái chảo Thái nhận nuôi bằng cả tấm lòng — những búp bông cải mềm ngọt nằm trong lớp sốt sánh mượt.",
      history: "Thực đơn Thái ở xứ người nuôi lớn món này vì một lý do giản dị nhất: bông cải xanh phương Tây cũng mê cái chảo lắm. Kỹ thuật đối đãi với nó thật dịu dàng — xào xém một lượt trên lửa lớn, rồi tới lớp sốt nhẹ đọng lại trong từng búp hoa. Đây là dĩa rau hiền lành nhất thực đơn: không ớt, không kịch tính, nhưng nấu kỹ lưỡng y như mọi món khác. Nhớ khana (cải rổ)? Hãy gọi người anh em họ gốc Hoa của nó. Còn đang gắp cho một người ăn uống dè dặt? Thì luôn luôn là dĩa này.",
    },
  },
  "mixed-vegetables": {
    description: "Rau củ chợ đảo nhanh trên chảo lửa lớn, giòn & bóng mượt.",
    story: {
      lede: "Món kinh điển của mâm cơm gia đình — hôm nay chợ có gì ngon nhất thì thứ đó lên chảo, đảo cho tới khi bóng mượt.",
      history: "Pad pak ruam (rau củ thập cẩm xào) không hẳn là một công thức, mà là cả một triết lý: người nội trợ Thái đi chợ trước rồi mới quyết định sau, và những cọng rau ngon nhất trong ngày gặp nhau trong cùng một cái chảo, với tỏi và một lớp sốt nhẹ, bóng mượt. Giữa một cái bàn chật kín cà ri và ớt, đây là khoảng lặng xanh — dĩa rau chịu lùi lại để mọi món khác được tỏa sáng. Dĩa của chúng tôi đổi theo phiên chợ, đúng như nó vốn phải vậy.",
    },
  },
  "ong-choy": {
    description: "Rau muống xào chớp nhoáng trên ngọn lửa gầm — tỏi, dầu hào, cọng giòn rôm & lá bóng mượt.",
    story: {
      lede: "Rau muống trên ngọn lửa gầm — một món xào kịch tính tới mức có hẳn một thị trấn Thái đem nó tung lên trời.",
      history: "Pad pak boong fai daeng — rau muống, lửa đỏ — được đặt tên theo ngọn lửa bùng lên khi mớ rau vừa chạm dầu nóng. Ở Phitsanulok, nó thành sân khấu đường phố theo đúng nghĩa đen: những người bán “rau bay” trứ danh hất nguyên chảo rau còn cháy phừng phừng bay ngang qua đường, cho một người đứng bên kia giữ thăng bằng cái dĩa mà hứng lấy. Nằm dưới màn trình diễn đó là một món ăn nghiêm túc — cọng rau rỗng ruột vẫn giữ nguyên độ giòn, tỏi, tương đậu nành và dầu hào, tất cả chín trong vài giây. Chúng tôi giữ ngọn lửa ở lại trong bếp; còn hương vị thì vẫn cứ bay.",
    },
  },
  "cashew-nut": {
    description: "Hạt điều rang béo ngậy, hành lá & ớt khô rang thơm — món xào kinh điển vị ngọt mặn hài hòa.",
    story: {
      lede: "Món cưng của bàn tiệc, mang tên một khu rừng trong thần thoại — di sản gốc Hoa dễ mến nhất của bếp Thái.",
      history: "Trong tiếng Thái, hạt điều gọi là med mamuang himmaphan — hạt của trái xoài xứ Himmaphan, khu rừng thần tiên trong thần thoại — bởi cái hạt ấy lủng lẳng bên dưới trái của nó như thể do một người kể chuyện bịa ra. Món xào này là hậu duệ của lối nấu tiệc Trung Hoa, được làm mềm lại cho vừa khẩu vị Thái: hạt điều rang béo ngậy, hành lá và ớt khô rang, thứ ớt chịu đổi cái rát bỏng lấy mùi thơm. Vị ngọt mặn hài hòa và hợp lòng tất cả mọi người, đây là dĩa hết sạch đầu tiên trên mọi mâm cơm gia đình.",
    },
  },
  "fried-whole-pompano": {
    description: "Nguyên con cá pompano chiên tới khi da vàng nổ giòn, phủ lớp sốt ớt ngọt bóng như sơn mài — nhớ rủ thêm bạn.",
    story: {
      lede: "Món chủ lực giữa bàn — nguyên một con cá, vàng ruộm và giòn rôm, đúng như mọi cuộc vui của người Thái xưa nay vẫn khăng khăng đòi hỏi.",
      history: "Ở Thái Lan, nguyên một con cá nghĩa là sung túc: nó giữ vị trí trung tâm trong đám cưới, trong tiệc năm mới và trong mọi bữa cơm sum họp đáng để lái xe đường xa mà về. Pla tod rad prik (cá chiên rưới sốt ớt) là dạng được thương nhất — chiên tới khi lớp da nổ giòn, rồi phủ lên một lớp sốt ớt cay ngọt bóng như sơn mài, len vào từng kẽ hở. Chúng tôi trao vinh dự ấy cho cá pompano, thịt trắng thanh ngọt, da ánh bạc, loại cá vốn hợp với chảo dầu. Cá ra bàn nguyên con, bởi đó mới chính là ý nghĩa của món: một con cá, nhiều bàn tay, và vận may.",
    },
  },
  "white-fish-mango-salad": {
    description: "Lớp bột áo mỏng nhẹ tênh, thịt cá trắng bong thành từng thớ — gỏi xoài cay, tươi rói cắt ngang từng miếng béo.",
    story: {
      lede: "Cái giòn gặp cái tươi — miếng cá chiên khoác lớp áo nhẹ như sương, nằm dưới một dĩa gỏi xoài cay: dĩa tương phản kinh điển của người Thái.",
      history: "Đầu bếp Thái xưa nay vẫn thuộc lòng một điều: đồ chiên thì thèm vị chua. Món yam mamuang (gỏi xoài) — xoài trộn chanh, ớt, hành tím và hạt điều — đã làm bạn với cá chiên giòn trong bếp Thái qua bao nhiêu đời, dĩa gỏi mát lạnh và tê rần đáp xuống lớp vỏ còn nóng hổi. Lớp bột áo giữ thật mỏng nhẹ để miếng cá vỡ tan; trái xoài thì gột lại vị giác cho bạn, sẵn sàng đón miếng béo kế tiếp. Một món ăn dựng lên bằng nhịp điệu, và nghe hoài không chán.",
    },
  },
  "narwhal-sundae": {
    description: "Bạn chọn cái kết — vani, sô cô la hay dâu, một cái bánh ốc quế giòn & từng cụm mây kem tươi đánh bông.",
    story: {
      lede: "Màn khép lại của quán — kem của bạn, cái kết của bạn, và cả một hệ thống thời tiết bằng kem tươi của chúng tôi.",
      history: "Quán ăn gia đình nào cũng cần một món tráng miệng chẳng phải giải thích gì mà vẫn khiến cả bàn im lặng ngay tức khắc. Của chúng tôi là Narwhal Sundae: vani, sô cô la hoặc dâu, một cái bánh ốc quế giòn, và từng cụm mây kem tươi — làm ra cho đứa nhỏ trong bàn, và cho cả người lớn cứ thề thốt rằng mình chỉ ăn đúng một muỗng thôi. Chúng tôi lấy tên quán đặt cho nó, bởi giống như con kỳ lân biển, món này giản dị, hơi có chút phép màu, và không thể nào nhìn mà không mỉm cười.",
    },
  },
  "mango-sticky-rice": {
    description: "Xôi ngọt còn ấm, xoài chín mát lạnh, một dòng cốt dừa đặc ngọt ngào — lời tạm biệt được thương nhất của xứ Thái.",
    story: {
      lede: "Lời tạm biệt được thương nhất của xứ Thái — dấu vết truy về tới cuối thời Ayutthaya, và tới giờ vẫn là lý do người ta mua vé bay về nhà mỗi mùa xoài.",
      history: "Khao niao mamuang (xôi xoài) là một mối tình xưa: xôi ngọt và những trái xoài quý đã xuất hiện trong thư tịch Xiêm La từ cuối thời Ayutthaya, và cặp đôi ấy được yêu chiều suốt triều vua Chulalongkorn. Cái nghi thức này thuộc về mùa — mỗi độ xuân về, khi xoài nam dok mai chín tới, là cả nước cùng ăn một lượt: xôi ấm, trái cây mát, và lớp cốt dừa đặc thoảng mặn buộc hai thứ lại với nhau. Chúng tôi dọn món này quanh năm. Bởi nỗi nhớ nhà ở California đâu có coi lịch bao giờ.",
    },
  },
  "coconut-ice-cream-bread": {
    description: "Đúng kiểu vỉa hè Bangkok — kem dừa mát lạnh trên ổ bánh mì mềm xốp như gối.",
    story: {
      lede: "Kiểu vỉa hè Bangkok — kem dừa mát lạnh trên ổ bánh mì mềm xốp như gối, ra đời từ cái thời nước đá còn là món xa xỉ của hoàng gia.",
      history: "Nước đá theo tàu biển cập bến Xiêm La hồi những năm 1860, quý tới mức chỉ được dọn trong các buổi tiếp tân của hoàng gia; phải tới khi những nhà máy nước đá mọc lên dưới triều vua Rama V thì món lạnh mới xuống được tới vỉa hè. Người bán hàng Thái, vốn thiếu sữa bò, bèn đem nước cốt dừa ra đánh thay — và i-tim kati (kem dừa) ra đời, từ bấy tới nay vẫn được múc cho đám học trò nhỏ. Ổ bánh mì mới là nước cờ cao tay: một ổ bánh ngọt mềm ôm lấy những viên kem lạnh, thành thứ tráng miệng bạn vừa đi vừa ăn được. Món quà vặt bình dân, mà gốc gác thì hoàng gia.",
    },
  },
  "banana-samosa": {
    description: "Vỏ bánh vàng giòn ôm lấy phần nhân chuối còn nóng hổi.",
    story: {
      lede: "Lớp vỏ vàng giòn ôm quanh miếng chuối mềm còn ấm — một món ngọt cầm tay để khép lại buổi tối.",
      history: "Chuối đã làm món tráng miệng của người Thái từ rất lâu trước khi ai đó nghĩ tới chuyện nhập đường về — nướng trên than, rim trong nước đường, tẩm bột chiên ở khắp các chợ. Cái vỏ samosa chỉ là chiếc áo mới khoác lên ý tưởng cũ ấy: một lớp bột mỏng gấp quanh miếng chuối chín rồi thả vào chảo dầu cho tới khi vỏ phồng rộp lên, để phần ruột bên trong quánh ngọt như mứt và nóng hổi. Ăn ngay trong vài phút đầu là ngon nhất, khi cái giòn và cái mềm còn đang cãi nhau.",
    },
  },
  "roti": {
    description: "Roti áp chảo thơm bơ, tơi giòn từng lớp — kiểu vỉa hè Thái, dọn theo lối ngọt.",
    story: {
      lede: "Miếng roti vừa rời mặt chảo, thơm bơ và tơi từng lớp, gấp lại rồi dọn theo lối ngọt đúng như hàng quán vỉa hè Thái vẫn làm.",
      history: "Roti theo chân những thương nhân Hồi giáo từ tiểu lục địa Ấn Độ mà sang Thái Lan, rồi trở thành một trong những món tráng miệng vỉa hè được thương nhất xứ này — chiếc xe đẩy với cái chảo gang phẳng là gương mặt quen của mọi chợ đêm. Bột được kéo mỏng như tờ giấy, quăng xuống mặt chảo đầy bơ cho tới khi phồng rộp và giòn rụm, rồi gấp lại và hoàn thiện bằng vị ngọt, bản kinh điển là sữa đặc với đường. Rìa bánh giòn, những nếp gấp mềm, ăn lúc còn nóng.",
    },
  },
  "thai-tea": {
    description: "Trà ủ đậm, màu hổ phách ánh cam, ngọt & béo, rót trên đá.",
    story: {
      lede: "Biểu tượng màu hổ phách — sinh ra từ nghề buôn trà ở khu Chinatown của Bangkok năm 1945, và từ đó tới nay vẫn được rót đầy ly đá cao.",
      history: "Trà Thái khởi đầu trên đường Yaowarat, nơi một gia đình người Triều Châu buôn trà nhận ra rằng bán trà Tàu nóng ở xứ nhiệt đới là chuyện khó vô cùng. Năm 1945, họ pha ra một loại hồng trà sinh ra để ủ thật đậm, thêm đường rồi rót lên đá — cha yen (trà Thái đá) ra đời từ đó. Sữa đặc và sữa cô đặc không đường, những thứ trữ được lâu trong cái nóng, đội lên cho ly trà cái vương miện béo ngậy; còn hương rang và hương gia vị trong hỗn hợp trà mới là thứ làm nên sắc hổ phách trứ danh. Chỉ một ngụm thôi, là bạn đã đứng trên vỉa hè Bangkok.",
    },
  },
  "lime-thai-tea": {
    description: "Trà Thái vắt thêm chanh tươi cho bừng lên — ngọt, gắt, lạnh buốt.",
    story: {
      lede: "Cha manao — người anh em vỉa hè chịu bỏ vị béo của sữa để đổi lấy một trái chanh vắt.",
      history: "Cứ một người Thái uống trà kiểu béo sữa thì lại có một người uống trà kiểu chua thanh. Cha manao vẫn là thứ hồng trà ủ thật đậm ấy, chỉ bỏ sữa đi để nhường chỗ cho chanh tươi và đường trên đá — thức uống của giờ nắng gắt nhất trong ngày. Mấy người bán dạo sẽ nói với bạn rằng nó giải cay còn giỏi hơn cả người anh em nổi tiếng kia. Ngọt, gắt, lạnh buốt, và hết nhanh quá đỗi.",
    },
  },
  "thai-green-tea": {
    description: "Người anh em họ màu ngọc lục bảo — béo ngậy, thơm lừng, lạnh buốt.",
    story: {
      lede: "Người anh em họ màu ngọc lục bảo — vẫn cái nếp trà sữa đá của người Thái, chỉ là đem tô màu xanh.",
      history: "Khi trà xanh quét qua khắp châu Á, Thái Lan đáp lời bằng đúng giọng của mình: ủ cho thật đậm, cho đường một cách thật thà, rồi rót lên đá cùng với sữa — trọn vẹn bài bản cha yen, nhưng khoác màu ngọc lục bảo. Trà sữa xanh Thái trở thành món kinh điển của chợ đêm thời nay, dịu hơn người anh em màu hổ phách một chút, và đọng lại một hậu vị thơm, gần như có hương hoa. Cùng một cái hồn, chỉ khác màu áo.",
    },
  },
  "thai-coffee": {
    description: "Cà phê rang đậm kiểu xưa, làm ngọt theo lối Thái.",
    story: {
      lede: "Cà phê Thái kiểu xưa — rang đậm theo lối truyền thống và ngọt một cách chẳng cần xin lỗi ai.",
      history: "Ly cà phê kinh điển của Thái Lan là con cháu của những hàng cà phê người Triều Châu — cái truyền thống mà bản đen đá của nó, oliang, lấy tên từ chữ Triều Châu nghĩa là “đen và lạnh”. Hạt cà phê được rang thật đậm, theo lối cổ thì rang chung với ngũ cốc và mè cho tròn vị, pha qua chiếc vợt vải, rồi hoàn thiện bằng vị ngọt và béo. Đó là cà phê đúng như cách Bangkok đã rót suốt bao nhiêu thế hệ: đậm đủ để không bị đá đánh bại, ngọt đủ để được tính là một món quà vặt.",
    },
  },
  "iced-tea": {
    description: "Thanh sạch, lạnh & uống hoài không ngán.",
    story: {
      lede: "Ngụm nước thẳng thắn nhất — ủ trong veo, rót đầy ly cao, chẳng ai cãi vào đâu được.",
    },
  },
  "fresh-coconut": {
    description: "Dừa tươi ướp lạnh — uống thẳng từ trái.",
    story: {
      lede: "Uống thẳng từ trái — thức giải khát nguyên thủy của xứ Thái, già hơn mọi công thức có trên thực đơn này.",
      history: "Người Thái gọi cây dừa là cây trăm công dụng: nó lợp mái nhà, làm ngọt nồi cà ri, làm sánh tô canh — và đưa cho bạn một ly nước. Một trái dừa tươi, ướp lạnh nguyên cả trái, là thứ giải khát lâu đời nhất của xứ này: nước trong veo, ngọt dịu, còn phần cơm dừa mềm thì nằm đợi dưới đáy để bạn nạo bằng muỗng. Không công thức. Cũng không cách nào cải tiến thêm được nữa. Chúng tôi chỉ giữ cho dừa thật lạnh, thật lạnh mà thôi.",
    },
  },
  "hot-coffee": {
    description: "Cà phê rang đậm kiểu xưa, dọn ra nóng & thật thà.",
    story: {
      lede: "Dành cho người hoài cổ — một ly nóng, uống thong thả để khép lại bữa ăn.",
    },
  },
  "hot-tea": {
    description: "Trà Thái, nghi ngút khói & thơm lừng.",
    story: {
      lede: "Lời tạm biệt ấm áp — trà Thái bỏ đá đi, giữ trọn phần hương.",
    },
  },
  "soda": {
    description: "Coke · Diet Coke · Dr Pepper · Sprite.",
    story: {
      lede: "Mấy thức uống có ga kinh điển rót trên đá — điểm chung của mọi bàn ăn.",
    },
  },
  "pink-milk": {
    description: "Sữa đá pha si rô sala — hồng, ngọt, nguyên một trời ký ức.",
    story: {
      lede: "Hồng, ngọt, nguyên một trời ký ức — thức uống mà đứa trẻ Thái nào cũng lớn lên cùng, gọi một ly sau giờ tan học.",
      history: "Nom yen — “sữa lạnh” — là cả nước Thái gói trong một cái ly: sữa rót lên đá, nhuộm hồng bằng si rô trái sala, nổi tiếng nhất là loại rót ra từ chai Hale's Blue Boy đứng trong chạn bếp nhà nào ở Thái cũng có. Đó là vị của căng tin trường học và mấy tiệm tạp hóa đầu hẻm, là phần thưởng ba má mua cho khi con mang về tấm phiếu điểm đẹp. Gọi nó chung với một món thật cay — đây là cái bình chữa cháy hiệu nghiệm nhất trên thực đơn này.",
    },
  },
  "passion-fruit": {
    description: "Chua ngọt & rực nắng.",
    story: {
      lede: "Chua ngọt và rực nắng — cứ để xứ nhiệt đới lên tiếng.",
    },
  },
  "fresh-cucumber": {
    description: "Mát, xanh & đã khát.",
    story: {
      lede: "Mát, xanh và đã khát — ly nước điềm tĩnh nhất trên thực đơn này.",
    },
  },
  "pineapple-soda": {
    description: "Trái thơm vàng ruộm cùng chút sủi tăm.",
    story: {
      lede: "Thơm Thái vàng ruộm, được nâng lên bằng chút ga lăn tăn — nắng vàng mà biết sủi tăm.",
    },
  },
};
