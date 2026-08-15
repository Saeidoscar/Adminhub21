import Link from "next/link"
import type { ReactNode } from "react"

export const metadata = {
  title: "قوانین و مقررات | دادلاین",
  description:
    "شرایط و ضوابط استفاده از خدمات سایت مشاوره حقوقی دادلاین — لطفاً پیش از استفاده مطالعه نمایید",
}

const Section = ({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) => (
  <section id={id} className="scroll-mt-28">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0">
        {id}
      </span>
      {title}
    </h2>
    <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  </section>
)

const Item = ({ children }: { children: ReactNode }) => (
  <p className="text-sm leading-7 pr-4 border-r-2 border-gray-200 dark:border-gray-700">
    {children}
  </p>
)

const sections = [
  { id: "۱", title: "تعاریف و مفاهیم" },
  { id: "۲", title: "شرایط استفاده از خدمات" },
  { id: "۳", title: "تعهدات کاربران" },
  { id: "۴", title: "مسئولیت‌های دادلاین" },
  { id: "۵", title: "حقوق مالکیت معنوی" },
  { id: "۶", title: "حریم خصوصی و حفاظت داده" },
  { id: "۷", title: "شرایط متخصصان حقوقی" },
  { id: "۸", title: "تغییرات در مقررات" },
  { id: "۹", title: "فسخ و توقف خدمات" },
  { id: "۱۰", title: "مسئولیت محدود" },
  { id: "۱۱", title: "قوانین حاکم و حل اختلاف" },
]

const TermsPage = () => {
  const lastUpdated = "1405/05/20"

  return (
    <>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-medium mb-4">
              آخرین به‌روزرسانی: {lastUpdated}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              قوانین و مقررات استفاده از خدمات دادلاین
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              با تشکر از شما که از سایت مشاوره حقوقی دادلاین استفاده می‌کنید.
              لطفاً پیش از استفاده از خدمات سایت، شرایط و مقررات زیر را به‌دقت
              مطالعه نمایید. استفاده از خدمات سایت به‌معنای پذیرش کامل این شرایط
              و ضوابط است.
            </p>
          </div>

          <div className="flex gap-10">
            <article className="flex-1 flex flex-col gap-10">
              <Section id="۱" title="تعاریف و مفاهیم">
                <Item>
                  <strong>۱.۱ سایت دادلاین:</strong> پلتفرم آنلاین به نشانی
                  www.dadline.net که به‌منظور ارائه مشاوره حقوقی آنلاین و خدمات
                  مربوط به عقد قراردادهای الکترونیکی و امضای دیجیتال قراردادها
                  تأسیس گردیده است.
                </Item>
                <Item>
                  <strong>۱.۲ کاربر:</strong> هر شخص حقیقی یا حقوقی که از خدمات
                  سایت دادلاین استفاده می‌کند، اعم از مشاوره حقوقی، ایجاد و امضای
                  قراردادهای الکترونیکی یا سایر خدمات سایت.
                </Item>
                <Item>
                  <strong>۱.۳ خدمات سایت:</strong> شامل مشاوره حقوقی آنلاین در
                  زمینه‌های مختلف حقوقی، ایجاد و امضای قراردادهای الکترونیکی، و
                  سایر خدمات مرتبط که از طریق پلتفرم سایت دادلاین به کاربران
                  ارائه می‌شود.
                </Item>
                <Item>
                  <strong>۱.۴ متخصصان حقوقی:</strong> وکلا، قضات، کارشناسان
                  حقوقی و سایر متخصصان حوزه حقوقی که خدمات مشاوره‌ای یا عقد
                  قراردادهای الکترونیکی در سایت دادلاین ارائه می‌دهند.
                </Item>
              </Section>

              <Section id="۲" title="شرایط استفاده از خدمات سایت">
                <Item>
                  <strong>۲.۱</strong> با استفاده از خدمات سایت دادلاین، کاربران
                  موافقت خود را با تمامی شرایط و مقررات این سایت اعلام می‌کنند.
                </Item>
                <Item>
                  <strong>۲.۲ خدمات مشاوره‌ای:</strong> خدمات مشاوره حقوقی از
                  طریق کارشناسان حقوقی شامل وکلا، قضات و کارشناسان حقوقی به‌صورت
                  آنلاین ارائه می‌شود. این خدمات تنها به‌منظور راهنمایی‌های ابتدایی
                  است و نباید به‌عنوان مشاوره حقوقی قطعی یا جایگزین مشاوره حضوری
                  تلقی گردد.
                </Item>
                <Item>
                  <strong>۲.۳ قراردادهای الکترونیکی:</strong> سایت دادلاین امکان
                  ایجاد، تنظیم و امضای الکترونیکی قراردادها را فراهم می‌آورد.
                  امضای قراردادها از طریق پلتفرم امن و با استفاده از سیستم‌های
                  امضای دیجیتال معتبر انجام می‌شود.
                </Item>
                <Item>
                  <strong>۲.۴</strong> سایت دادلاین هیچ‌گونه مسئولیتی در قبال
                  تصمیمات و اقدامات قانونی که به‌موجب مشاوره‌ها یا قراردادهای امضا
                  شده انجام می‌شود، نخواهد داشت.
                </Item>
              </Section>

              <Section id="۳" title="تعهدات و مسئولیت‌های کاربران">
                <Item>
                  <strong>۳.۱ دقت و صحت اطلاعات:</strong> کاربران موظفند تمامی
                  اطلاعات موردنیاز برای استفاده از خدمات مشاوره‌ای و امضای
                  قراردادها را به‌طور کامل، دقیق و صحیح وارد نمایند.
                </Item>
                <Item>
                  <strong>۳.۲ رعایت اصول اخلاقی و قانونی:</strong> کاربران باید
                  از درخواست مشاوره در موضوعات غیرقانونی، توهین‌آمیز، تهدیدآمیز،
                  یا مغایر با اخلاقیات اجتماعی خودداری نمایند. همچنین از استفاده
                  از خدمات سایت برای تنظیم یا امضای قراردادهای غیرقانونی اجتناب
                  کنند.
                </Item>
                <Item>
                  <strong>۳.۳ حفاظت از اطلاعات شخصی:</strong> کاربران متعهد
                  می‌شوند که اطلاعات شخصی خود را محرمانه نگه‌دارند و از افشای آن
                  به اشخاص ثالث جلوگیری نمایند.
                </Item>
              </Section>

              <Section id="۴" title="مسئولیت‌های سایت دادلاین">
                <Item>
                  <strong>۴.۱</strong> سایت دادلاین تمامی تلاش خود را برای ارائه
                  خدمات مشاوره‌ای دقیق، به‌روز و مطابق با استانداردهای حقوقی به
                  کاربران به‌کار می‌گیرد.
                </Item>
                <Item>
                  <strong>۴.۲ احراز هویت متخصصان حقوقی:</strong> تمامی وکلا،
                  قضات و کارشناسان حقوقی که قصد ارائه مشاوره دارند، باید فرآیند
                  احراز هویت و تأیید صلاحیت را تکمیل نمایند. سایت دادلاین از صحت
                  و اعتبار مدارک ارائه‌شده اطمینان حاصل می‌کند.
                </Item>
                <Item>
                  <strong>۴.۳</strong> سایت دادلاین ممکن است به‌صورت دوره‌ای
                  به‌روزرسانی‌هایی در سیستم یا خدمات خود اعمال نماید تا کیفیت
                  خدمات را ارتقا دهد.
                </Item>
              </Section>

              <Section id="۵" title="حقوق مالکیت معنوی">
                <Item>
                  <strong>۵.۱</strong> تمام حقوق مالکیت معنوی مرتبط با محتوای
                  سایت دادلاین، شامل مقالات، مشاوره‌ها، گرافیک‌ها، نرم‌افزارها،
                  کدهای برنامه‌نویسی، تصاویر و سایر مطالب موجود در سایت، متعلق به
                  سایت دادلاین و یا صاحبان حقوق آن است.
                </Item>
                <Item>
                  <strong>۵.۲</strong> هرگونه استفاده تجاری، کپی‌برداری، بازنشر
                  یا توزیع محتوای سایت بدون کسب اجازه کتبی از مدیریت سایت
                  دادلاین ممنوع است.
                </Item>
              </Section>

              <Section id="۶" title="حفظ حریم خصوصی و حفاظت از داده‌ها">
                <Item>
                  <strong>۶.۱</strong> سایت دادلاین متعهد به حفظ حریم خصوصی و
                  امنیت اطلاعات کاربران است و از اطلاعات شخصی کاربران تنها
                  به‌منظور ارائه خدمات مشاوره‌ای استفاده خواهد کرد.
                </Item>
                <Item>
                  <strong>۶.۲</strong> کلیه اطلاعات شخصی، مستندات حقوقی و سوابق
                  مشاوره‌ای کاربران به‌طور محرمانه نگهداری شده و تحت هیچ شرایطی به
                  اشخاص ثالث غیرمجاز افشا نخواهد شد، مگر در مواردی که قانون
                  ایجاب کند.
                </Item>
                <Item>
                  <strong>۶.۳</strong> سایت دادلاین ممکن است از اطلاعات کاربران
                  برای بهبود کیفیت خدمات خود و برای مقاصد آماری (به‌صورت ناشناس)
                  استفاده نماید.
                </Item>
              </Section>

              <Section id="۷" title="شرایط خاص برای متخصصان حقوقی">
                <Item>
                  <strong>۷.۱ وکلا و مشاوران حقوقی:</strong> وکلای عضو سایت
                  دادلاین می‌بایست به‌طور کامل به کدهای اخلاق حرفه‌ای و قوانین و
                  مقررات مربوط به وکالت در جمهوری اسلامی ایران پایبند باشند.
                </Item>
                <Item>
                  <strong>۷.۲ قضات و کارشناسان حقوقی:</strong> متخصصان می‌توانند
                  از خدمات سایت برای مشاوره با دیگر همکاران حقوقی خود و تبادل
                  نظر در مسائل تخصصی استفاده کنند.
                </Item>
                <Item>
                  <strong>۷.۳ احراز هویت متخصصان:</strong> تمامی وکلا، قضات و
                  کارشناسان حقوقی باید فرآیند احراز هویت و تأیید صلاحیت خود را
                  از طریق سیستم سایت تکمیل کنند. تنها افرادی که تأیید صلاحیت شده
                  باشند، قادر به فعالیت در سایت خواهند بود.
                </Item>
              </Section>

              <Section id="۸" title="تغییرات در شرایط و مقررات">
                <Item>
                  <strong>۸.۱</strong> سایت دادلاین این حق را برای خود محفوظ
                  می‌دارد که در هر زمان تغییراتی در شرایط و مقررات خود اعمال
                  نماید.
                </Item>
                <Item>
                  <strong>۸.۲</strong> تغییرات اعمال‌شده بلافاصله پس از انتشار در
                  سایت معتبر خواهد بود و کاربران ملزم به بررسی و پذیرش شرایط
                  جدید هستند.
                </Item>
                <Item>
                  <strong>۸.۳</strong> ادامه استفاده از خدمات سایت پس از تغییر
                  شرایط به‌معنای پذیرش کامل شرایط جدید است.
                </Item>
              </Section>

              <Section id="۹" title="فسخ و توقف خدمات">
                <Item>
                  <strong>۹.۱</strong> سایت دادلاین این اختیار را دارد که در
                  صورت تخلف کاربران از این شرایط و مقررات، دسترسی به خدمات سایت
                  را به‌طور موقت یا دائمی مسدود نماید.
                </Item>
                <Item>
                  <strong>۹.۲</strong> در صورتی که هر یک از خدمات سایت به‌دلیل
                  مسائل فنی یا قانونی غیرقابل دسترس گردد، سایت دادلاین مسئولیتی
                  در قبال خسارات ناشی از این وقفه‌ها نخواهد داشت.
                </Item>
              </Section>

              <Section id="۱۰" title="مسئولیت محدود">
                <Item>
                  <strong>۱۰.۱</strong> سایت دادلاین هیچ‌گونه مسئولیتی در قبال
                  خسارات مستقیم یا غیرمستقیمی که از استفاده یا عدم استفاده از
                  خدمات سایت به کاربران یا اشخاص ثالث وارد شود، نخواهد داشت.
                </Item>
                <Item>
                  <strong>۱۰.۲</strong> مشاوره‌های ارائه‌شده از طریق سایت دادلاین
                  تنها به‌عنوان راهنمایی‌های حقوقی اولیه محسوب می‌شوند و نباید
                  به‌عنوان مشاوره نهایی یا نمایندگی قانونی در مراجع قضائی تلقی
                  شوند.
                </Item>
              </Section>

              <Section id="۱۱" title="قوانین حاکم و حل اختلافات">
                <Item>
                  <strong>۱۱.۱</strong> این شرایط و مقررات تحت قوانین جمهوری
                  اسلامی ایران تنظیم شده است.
                </Item>
                <Item>
                  <strong>۱۱.۲</strong> هرگونه اختلاف یا دعوی ناشی از استفاده از
                  خدمات سایت، در مراجع قضائی صالح جمهوری اسلامی ایران قابل
                  رسیدگی خواهد بود.
                </Item>
              </Section>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                برای هرگونه سوال درباره این شرایط، می‌توانید از طریق{" "}
                <Link
                  href="/contact"
                  className="text-primary hover:underline font-medium"
                >
                  صفحه تماس با ما
                </Link>{" "}
                یا ایمیل{" "}
                <a
                  href="mailto:dadlinenet@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  dadlinenet@gmail.com
                </a>{" "}
                با ما در ارتباط باشید.
              </div>
            </article>

            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">
                    فهرست مطالب
                  </h3>
                  <nav className="flex flex-col gap-2">
                    {sections.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors py-1"
                      >
                        <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400 shrink-0">
                          {s.id}
                        </span>
                        {s.title}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    سوالی درباره قوانین دارید؟
                  </p>
                  <Link
                    href="/contact"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    تماس با پشتیبانی ←
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}

export default TermsPage
