import type { ReactNode } from "react"
import Image from "next/image"
import {
  TbBriefcase2,
  TbFileCertificate,
  TbFileDescription,
  TbGavel,
  TbMessages,
  TbPhoneCall,
  TbMessageChatbot,
  TbScale,
  TbSparkles,
  TbUsers,
} from "react-icons/tb"

type ServiceCardProps = {
  icon: ReactNode
  title: string
  description: string
  position: string
  delay?: string
  badge?: string
}

const ServiceCard = ({
  icon,
  title,
  description,
  position,
  delay = "",
  badge,
}: ServiceCardProps) => {
  return (
    <div dir="rtl" className={`absolute z-20 w-42 ${position} ${delay}`}>
      <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-[0_14px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl [animation-duration:2s] motion-reduce:animate-none dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/20">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary shadow-sm dark:border-primary/20 dark:bg-slate-950">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100">
                {title}
              </span>
            </div>

            <p className="mt-1 text-[9px] leading-4 text-slate-400 dark:text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-emerald-500" />

          <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500">
            آماده ارائه خدمت
          </span>

          <div className="mr-auto h-px w-8 bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  )
}

const AuthSideBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 isolate overflow-hidden rounded-3xl bg-transparent select-none"
    >
      {/* Subtle neutral grid */}
      <div className="absolute inset-0 opacity-70 mask-[radial-gradient(circle_at_center,black,transparent_88%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-size-[42px_42px] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
      </div>

      {/* Architectural guide lines */}
      <div className="absolute top-1/2 left-1/2 h-px w-[82%] -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-transparent via-slate-300/40 to-transparent dark:via-slate-700/40" />

      <div className="absolute top-1/2 left-1/2 h-[80%] w-px -translate-x-1/2 -translate-y-1/2 bg-linear-to-b from-transparent via-slate-300/40 to-transparent dark:via-slate-700/40" />

      <div className="absolute top-1/2 left-1/2 h-px w-[72%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-linear-to-r from-transparent via-slate-300/20 to-transparent dark:via-slate-700/30" />

      <div className="absolute top-1/2 left-1/2 h-px w-[72%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-linear-to-r from-transparent via-slate-300/20 to-transparent dark:via-slate-700/30" />

      {/* Outer orbit */}
      <div className="absolute top-1/2 left-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative size-full animate-spin rounded-full border border-dashed border-slate-300/60 [animation-duration:45s] motion-reduce:animate-none dark:border-slate-700/60">
          <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950" />

          <div className="absolute top-1/2 -right-1 size-2 -translate-y-1/2 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950" />

          <div className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950" />

          <div className="absolute top-1/2 -left-1 size-2 -translate-y-1/2 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950" />
        </div>
      </div>

      {/* Middle orbit */}
      <div className="absolute top-1/2 left-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative size-full animate-spin rounded-full border border-dotted border-slate-300/70 [animation-direction:reverse] [animation-duration:30s] motion-reduce:animate-none dark:border-slate-700/70">
          <div className="absolute right-[33%] bottom-[24%]">
            <div className="animate-spin [animation-duration:30s] motion-reduce:animate-none">
              <div className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-md dark:border-white/10 dark:bg-slate-900">
                <TbGavel size={15} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-[22%] left-[24%]">
            <div className="animate-spin [animation-duration:30s] motion-reduce:animate-none">
              <div className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-md dark:border-white/10 dark:bg-slate-900">
                <TbScale size={15} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inner precision rings */}
      <div className="absolute top-1/2 left-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/50 dark:border-slate-700/50" />

      <div className="absolute top-1/2 left-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300/50 dark:border-slate-700/50" />

      <div className="absolute top-1/2 left-1/2 size-[27%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/40 dark:border-slate-700/50">
        <div className="absolute inset-0 animate-ping rounded-full border border-slate-300/30 [animation-duration:4.5s] motion-reduce:animate-none dark:border-slate-700/40" />
      </div>

      {/* Center logo */}
      <div className="absolute top-1/2 left-1/2 z-30 flex size-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/30">
        <div className="relative flex size-19.5 items-center justify-center">
          <Image
            src="/img/icon/android-chrome-192x192.png"
            alt="لوگوی دادلاین"
            width={64}
            height={64}
            priority
            className="size-16 object-contain"
          />
        </div>
      </div>

      {/* Service cards */}
      <ServiceCard
        icon={<TbFileDescription size={19} />}
        title="قرارداد آنلاین"
        description="تنظیم قراردادهای معتبر و اختصاصی"
        position="top-[8%] left-[10%]"
      />

      <ServiceCard
        icon={<TbPhoneCall size={19} />}
        title="مشاوره تلفنی"
        description="ارتباط مستقیم با وکیل متخصص"
        position="top-[7%] right-[9%]"
        delay="[animation-delay:700ms]"
      />

      <ServiceCard
        icon={<TbMessageChatbot size={19} />}
        title="هوش مصنوعی"
        description="دستیار هوشمند برای مسائل حقوقی"
        position="top-[31%] left-[4%]"
        delay="[animation-delay:1400ms]"
      />

      <ServiceCard
        icon={<TbFileCertificate size={19} />}
        title="تنظیم مستندات"
        description="تنظیم لوایح، دادخواست و اظهارنامه"
        position="top-[30%] right-[3%]"
        delay="[animation-delay:2100ms]"
      />

      <ServiceCard
        icon={<TbBriefcase2 size={19} />}
        title="بررسی پرونده"
        description="ارزیابی مدارک و مسیر حقوقی پرونده"
        position="bottom-[29%] left-[3%]"
        delay="[animation-delay:2800ms]"
      />

      <ServiceCard
        icon={<TbMessages size={19} />}
        title="پرسش حقوقی"
        description="دریافت پاسخ از متخصصان حقوقی"
        position="right-[3%] bottom-[28%]"
        delay="[animation-delay:3500ms]"
      />

      <ServiceCard
        icon={<TbUsers size={19} />}
        title="وکلای متخصص"
        description="دسترسی به وکلای تاییدشده دادلاین"
        position="bottom-[7%] left-[10%]"
        delay="[animation-delay:4200ms]"
      />

      <ServiceCard
        icon={<TbSparkles size={19} />}
        title="اشتراک حقوقی"
        description="پشتیبانی مستمر برای اشخاص و کسب‌وکارها"
        position="right-[9%] bottom-[7%]"
        delay="[animation-delay:4900ms]"
      />

      {/* Small legal particles */}
      <div className="absolute animate-ping top-[20%] left-[42%] size-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
      <div className="absolute animate-ping top-[27%] right-[37%] size-1 rounded-full bg-primary/60" />
      <div className="absolute animate-ping bottom-[23%] left-[39%] size-1 rounded-full bg-primary/60" />
      <div className="absolute animate-ping right-[42%] bottom-[17%] size-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
    </div>
  )
}

export default AuthSideBackground
