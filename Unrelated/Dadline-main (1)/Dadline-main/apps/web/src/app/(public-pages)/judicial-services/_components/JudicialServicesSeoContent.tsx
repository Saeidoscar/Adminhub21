import Link from "next/link"
import {
  TbArrowLeft,
  TbBuildingBank,
  TbDeviceLaptop,
  TbInfoCircle,
} from "react-icons/tb"
import { relatedSearchTopics } from "../_data/judicial-services"
import SectionHeading from "./SectionHeading"

const JudicialServicesSeoContent = () => (
  <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
    <div className="mx-auto max-w-7xl">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            align="start"
            eyebrow="خدمات غیرحضوری قوه قضاییه"
            title="دسترسی ساده‌تر به خدمات الکترونیک قضایی"
            description="سامانه خدمات قضایی دادلاین برای کاهش مراجعات غیرضروری، تکمیل دقیق اطلاعات و پیگیری شفاف درخواست‌ها طراحی شده است."
            icon={<TbBuildingBank aria-hidden size={18} />}
          />

          <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-8 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
            <div className="flex items-start gap-3">
              <TbInfoCircle
                aria-hidden
                className="mt-1 shrink-0 text-primary"
                size={21}
              />
              <p>
                بسته به نوع خدمت و الزامات احراز هویت، ممکن است بخشی از فرایند
                به‌صورت نیمه‌حضوری انجام شود. نیاز به مراجعه، پیش از ثبت نهایی
                به‌طور شفاف اعلام خواهد شد.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-8 text-gray-600 dark:text-gray-300 sm:text-base sm:leading-9">
          <p>
            خدمات غیرحضوری قوه قضاییه با هدف تسهیل دسترسی شهروندان، کاهش صف
            دفاتر و حذف رفت‌وآمدهای غیرضروری ارائه شده‌اند. در این شیوه، کاربران
            می‌توانند بخش مهمی از فرایندهایی مانند{" "}
            <strong>ثبت آنلاین دادخواست</strong>،{" "}
            <strong>ثبت لایحه قضایی</strong>،{" "}
            <strong>ثبت اینترنتی اظهارنامه</strong> و{" "}
            <strong>ثبت شکواییه غیرحضوری</strong> را از طریق سامانه آغاز و
            پیگیری کنند.
          </p>
          <p>
            برخلاف تنظیم صرف یک متن حقوقی، خدمات این صفحه برای ثبت رسمی اوراق
            قضایی طراحی شده‌اند. اطلاعات طرفین، موضوع، خواسته، شرح ماجرا، دلایل و
            پیوست‌ها در یک فرایند ساختاریافته دریافت می‌شوند؛ سپس درخواست از نظر
            کامل بودن بررسی شده و برای ادامه مراحل رسمی آماده می‌شود.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <TbDeviceLaptop aria-hidden size={22} />
                </div>
                <h3 className="font-black text-gray-950 dark:text-white">
                  خدمت غیرحضوری
                </h3>
              </div>
              <p className="mt-3 text-sm leading-7">
                تمام مراحل قابل انجام، از ثبت اطلاعات و مدارک تا پیگیری نتیجه،
                آنلاین انجام می‌شود و مراجعه حضوری لازم نیست.
              </p>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  <TbBuildingBank aria-hidden size={22} />
                </div>
                <h3 className="font-black text-gray-950 dark:text-white">
                  خدمت نیمه‌حضوری
                </h3>
              </div>
              <p className="mt-3 text-sm leading-7">
                اطلاعات و مدارک آنلاین تکمیل می‌شوند؛ فقط برای یک مرحله ضروری
                مانند احراز هویت یا امضا، مراجعه محدود و هماهنگ‌شده انجام می‌گیرد.
              </p>
            </article>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 sm:p-6">
            <h3 className="font-black text-gray-950 dark:text-white">
              موضوعات مرتبط با خدمات قضایی آنلاین
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedSearchTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="#services"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            انتخاب خدمت و شروع ثبت درخواست
            <TbArrowLeft aria-hidden size={18} />
          </Link>
        </div>
      </div>
    </div>
  </section>
)

export default JudicialServicesSeoContent
