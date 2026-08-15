import Link from "next/link"
import { TbArrowLeft, TbFileText } from "react-icons/tb"
import { judicialServices } from "../_data/judicial-services"
import SectionHeading from "./SectionHeading"

const JudicialServicesGrid = () => (
  <section
    id="services"
    className="scroll-mt-24 border-y border-gray-200 bg-gray-50/70 px-4 py-20 dark:border-gray-800 dark:bg-gray-950/30 sm:px-6 lg:px-8 lg:py-24"
  >
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="خدمات قابل ثبت"
        title="خدمات قضایی آنلاین و رسمی، گام‌به‌گام و مطمئن"
        description="خدمت موردنظر خود را انتخاب کنید؛ اطلاعات و مدارک لازم در هر مرحله به شما نمایش داده می‌شود و پس از بررسی، درخواست برای ثبت رسمی و پیگیری آماده خواهد شد."
        icon={<TbFileText aria-hidden size={18} />}
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {judicialServices.map((service) => {
          const Icon = service.icon

          return (
            <article
              key={service.slug}
              className={`group relative overflow-hidden rounded-3xl border p-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5 sm:p-6 border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/[0.02] dark:border-gray-800 dark:bg-gray-950 dark:hover:border-primary/40`}
            >
              <div className="pointer-events-none absolute -left-14 -top-14 size-44 rounded-full bg-white/60 blur-2xl dark:bg-white/5" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg bg-primary/10 text-primary ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-white`}
                  >
                    <Icon aria-hidden size={25} />
                  </div>

                  <span className="rounded-full border border-white/80 bg-primary/15 px-3 py-1 text-[11px] font-bold text-gray-600 backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-300">
                    {service.shortDescription}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-black text-gray-950 dark:text-white">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-8 text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>

                <Link
                  href={`/pishkhan/judicial-services/${service.slug}`}
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition group-hover:bg-primary dark:bg-white dark:text-gray-950 dark:group-hover:bg-primary dark:group-hover:text-white"
                >
                  {service.cta}
                  <TbArrowLeft
                    aria-hidden
                    className="transition-transform group-hover:-translate-x-1"
                    size={18}
                  />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  </section>
)

export default JudicialServicesGrid
