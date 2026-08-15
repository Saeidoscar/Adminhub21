import Link from "next/link"
import { TbArrowLeft, TbCheck, TbScale } from "react-icons/tb"

const JudicialServicesCta = () => (
  <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10 lg:px-14 lg:py-12">
      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
            <TbScale aria-hidden size={26} />
          </div>
          <h2 className="mt-5 text-2xl text-white leading-relaxed sm:text-3xl">
            درخواست قضایی خود را همین حالا آنلاین آغاز کنید
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-blue-100 sm:text-base">
            بدون صف، کاغذبازی و رفت‌وآمد غیرضروری؛ خدمت موردنظر را انتخاب کنید و
            اطلاعات و مدارک را مرحله‌به‌مرحله تکمیل کنید.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-blue-100 sm:text-sm">
            {[
              "فرایند روشن و قابل پیگیری",
              "پشتیبانی تخصصی",
              "حفظ محرمانگی اطلاعات",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <TbCheck aria-hidden size={17} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="#services"
          className="relative inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-black text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
        >
          شروع ثبت درخواست
          <TbArrowLeft aria-hidden size={19} />
        </Link>
      </div>
    </div>
  </section>
)

export default JudicialServicesCta
