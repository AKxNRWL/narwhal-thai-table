import Link from 'next/link';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { Section, Container, SectionHead } from '@/components/ui/Section';
import { SITE_URL, ORDER_ONLINE_URL, DIRECTIONS_URL, RESTAURANT } from '@/lib/site';
import { DISHES } from '@/lib/dishes';
import { OG_LOCALE } from '@/lib/i18n/locales';

/**
 * /vi/nha-hang-thai-little-saigon — the Vietnamese landing page for Little
 * Saigon (Westminster / Garden Grove / Fountain Valley), written in Vietnamese
 * only (no English twin — the English side has /thai-food-westminster).
 *
 * WHY: the owner's call (11 Sep 2026) — "เวียดนามชอบกินอาหารไทย แล้วคอมมูใหญ่มาก".
 * Little Saigon sits ten to fifteen minutes up the very road we are on, and
 * "nhà hàng Thái gần đây" / "quán Thái Little Saigon" searches have had no
 * Vietnamese-language answer from a Thai kitchen on Beach Blvd.
 *
 * Facts reused from /thai-food-westminster (verified on Google Maps 1 Sep 2026):
 * Westminster city center → 19072 Beach Blvd = 5.2 miles, ~12 min down Beach
 * Blvd (SR-39); OCTA Route 29 runs Beach Blvd (~19 min). Lunch facts from
 * lib/lunchPhotos.ts. Nothing else is claimed.
 */

const PATH = '/vi/nha-hang-thai-little-saigon';
const TITLE = 'Nhà hàng Thái gần Little Saigon — chạy thẳng đường Beach tới Narwhal Thai Table';
const DESCRIPTION =
  'Món Thái gần Little Saigon: Narwhal Thai Table ở 19072 Beach Blvd, Huntington Beach — từ Westminster chạy thẳng đường Beach khoảng 12 phút, hoặc xe buýt OCTA tuyến 29. Cà ri giã tay, gỏi và đồ nướng kiểu Isaan, hủ tiếu thuyền Thái, món trưa đặc biệt ngày thường từ $11.99, đặt online đến lấy hoặc giao qua DoorDash. Thực đơn đầy đủ bằng tiếng Việt.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: PATH,
    languages: { 'vi-VN': PATH, 'x-default': PATH },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'article',
    locale: OG_LOCALE.vi,
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/vi` },
    { '@type': 'ListItem', position: 2, name: 'Nhà hàng Thái gần Little Saigon', item: `${SITE_URL}${PATH}` },
  ],
};

function Dish({ slug, children }: { slug: string; children: React.ReactNode }) {
  return <Link href={`/vi/menu/${slug}`}>{children}</Link>;
}

/* "Trang tiếng Anh" tail — sits outside `.prose-nt`, so its links are styled here. */
const tailLinks =
  '[&_a]:text-brass-light [&_a]:underline [&_a]:decoration-brass/40 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-cream [&_a:hover]:decoration-brass-light';

export default function LittleSaigonPage() {
  return (
    <Section first tone="glow">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Container narrow>
        <SectionHead
          align="left"
          as="h1"
          size="md"
          eyebrow="Bà con Little Saigon"
          title={<>Món Thái gần Little Saigon — <em>một con đường, mười mấy phút</em>.</>}
          lede={
            <>
              Con đường này bạn đã quá quen. Đường Beach chạy thẳng từ Westminster xuống Huntington Beach,
              và chúng tôi nằm ngay trên đó — góc Garfield, cách trung tâm Westminster 5,2 dặm về phía nam.
              Khoảng mười hai phút lái xe, không cần lên xa lộ, chỉ một lần quẹo ở cuối đường.
            </>
          }
        />
      </Container>

      {/* Reading column: semantic HTML inside `.prose-nt` (globals.css). */}
      <Container narrow className="mt-12 lg:mt-16">
        <div className="prose-nt">
          <h2>Đường đi từ <em>Little Saigon</em></h2>
          <p>
            Từ Bolsa, ra <strong>đường Beach (State Route 39)</strong> rồi chạy về hướng nam, qua
            Westminster Blvd, Warner và Slater tới Garfield Ave — quán ở ngay góc đường, số{' '}
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener">{RESTAURANT.address.street}</a>, đậu xe
            miễn phí trong bãi của khu plaza phía trước. Tối nay không có xe? Xe buýt OCTA tuyến 29 chạy dọc
            đường Beach và dừng gần Garfield — khoảng mười chín phút từ trung tâm Westminster.
          </p>

          <h2>Người mình ăn món Thái: <em>quen chỗ nào, lạ chỗ nào</em></h2>
          <p>
            Bếp Thái và bếp Việt là hàng xóm gần: cũng nước mắm, cũng rau thơm tươi, cũng chua–cay–mặn–ngọt đi
            chung một dĩa. Chỗ khác là “giọng”: riềng thay cho gừng, lá chanh Thái, húng quế, và sốt cà ri giã
            từ ớt khô, tỏi và sả trong cối đá chứ không múc từ hộp. Ghé thử những món khó tìm được bản nấu đúng
            nhất — <Dish slug="thai-boat-noodles">hủ tiếu thuyền Thái (boat noodles)</Dish> với nước lèo đậm,
            hầm nhiều giờ; góc Isaan với <Dish slug="som-tum-thai">som tum (gỏi đu đủ Thái)</Dish>,{' '}
            <Dish slug="larb">larb</Dish> và <Dish slug="crying-tiger">crying tiger</Dish>; và một dĩa{' '}
            <Dish slug="green-curry">cà ri xanh</Dish> thơm mùi rau trước khi thấy cay.
          </p>
          <p>
            Tên món trên thực đơn giữ nguyên tiếng Anh và tiếng Thái để bạn gọi món cho dễ, còn câu chuyện,
            nguyên liệu và cách ăn của từng món đều có bằng tiếng Việt — bấm vào món nào cũng đọc được.
          </p>

          <h2>Ăn trưa trên đường — <em>Thứ Hai đến Thứ Sáu tới 3 giờ</em></h2>
          <p>
            <Link href="/vi/lunch">Món trưa đặc biệt</Link> bắt đầu từ $11.99, kèm xà lách tươi và một cuốn chả
            giò giòn, thêm một chén súp khi ăn tại quán: <Dish slug="og-pad-thai">Pad Thai</Dish>,{' '}
            <Dish slug="pad-see-ew">Pad See Ew</Dish>, <Dish slug="pad-kee-mao">Pad Kee Mao</Dish>,{' '}
            <Dish slug="krapow-over-rice">Krapow</Dish>, <Dish slug="garlic-pepper-over-rice">Garlic &amp; Pepper</Dish>,{' '}
            <Dish slug="cashew-nut">Cashew</Dish>, <Dish slug="mixed-vegetables">Mixed Vegetables</Dish>, hoặc cà ri{' '}
            <Dish slug="yellow-curry">Yellow</Dish> / <Dish slug="panang-curry">Panang</Dish>. Gọi{' '}
            <a href="tel:+17143786003">(714) 378-6003</a> lúc rời Little Saigon là tới quán đã có sẵn.
          </p>

          <h2>Mang về, giao tận nơi, và <em>đãi cả nhà</em></h2>
          <p>
            Mười mấy phút đường Beach là một chuyến đến lấy rất dễ — cà ri, cơm chiên và{' '}
            <Dish slug="narwhal-chicken-wings">Narwhal Chicken Wings</Dish> đều mang đi xa vẫn ngon, và mọi món
            trong thực đơn đều có thể{' '}
            {ORDER_ONLINE_URL ? <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener">đặt online để đến lấy</a> : 'đặt trước để đến lấy'}.
            Giao tận nơi qua DoorDash ở những địa chỉ có phục vụ; chi tiết trên{' '}
            <Link href="/order">trang đặt món (tiếng Anh)</Link>. Tiệc công ty, sinh nhật, đám giỗ hay bữa cơm
            đại gia đình ở Westminster và Garden Grove — chúng tôi <Link href="/vi/contact/catering">nhận nấu tiệc</Link>,
            và cả nhà hàng có thể bao trọn cho buổi riêng.
          </p>

          <h2>Ở lại <em>ăn tối</em></h2>
          <p>
            Phòng ăn nhỏ và ấm, sân hiên giăng dây đèn và cho phép dắt chó, vài loại rượu vang, và một dĩa xôi
            xoài khép lại bữa tối đúng kiểu bữa cơm gia đình Thái. Gọi một con{' '}
            <Dish slug="fried-whole-pompano">cá pompano chiên nguyên con</Dish> cho cả bàn là bạn sẽ hiểu vì sao
            đáng chạy xuống đây. <Link href="/vi/contact/reservation">Đặt bàn trước</Link>, hoặc ghé thẳng bất cứ ngày nào.
          </p>
        </div>

        {/* Directions already lives in the phone action bar — hide that one there. */}
        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-cream/10 pt-10">
          <Button href="/vi/lunch" variant="primary" arrow>Xem món trưa đặc biệt</Button>
          <Button href={DIRECTIONS_URL} variant="secondary" target="_blank" rel="noopener" className="max-[760px]:hidden">Chỉ đường từ Little Saigon</Button>
          <Button href="/vi/menu" variant="secondary">Xem tất cả {DISHES.length} món</Button>
        </div>

        <p className={`mt-8 text-[15px] leading-relaxed text-cream/60 ${tailLinks}`}>
          Trang tiếng Anh: <Link href="/thai-food-westminster">Thai food near Westminster</Link> ·{' '}
          <Link href="/thai-food-fountain-valley">Thai food near Fountain Valley</Link> · <Link href="/thai-food-orange-county">cẩm nang món Thái ở Orange County</Link>.
        </p>
      </Container>
    </Section>
  );
}
