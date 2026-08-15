import Link from "next/link"
import { TbArrowLeft, TbShieldCheck } from "react-icons/tb"
import type { ProviderDetail } from "@/@types/vendors"
import {
  PROVIDER_PROFILE_LABELS,
  type ProviderProfileKind,
} from "./provider-profile.types"

export const ProviderContactSection = ({
  provider,
  kind,
}: {
  provider: ProviderDetail
  kind: ProviderProfileKind
}) => {
  const labels = PROVIDER_PROFILE_LABELS[kind]
  return (
    <section
      id="contact"
      className="px-4 sm:px-8 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-950/40 py-12 "
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden bg-primary px-6 py-8 text-white sm:px-12 rounded-2xl text-center sm:text-start">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/15" />
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full border border-white/15" />
        <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <TbShieldCheck size={20} /> درخواست امن و قابل پیگیری در دادلاین
            </div>
            <h2 className="mt-5 max-w-3xl text-2xl leading-snug text-white">
              برای دریافت مشاوره از {provider.name} آماده‌اید؟
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              خدمت مناسب را انتخاب کنید تا فرایند درخواست، بررسی و پیگیری آغاز
              شود.
            </p>
          </div>
          <Link
            href="#services"
            className="inline-flex min-h-14 items-center rounded-2xl justify-center gap-3 bg-white px-7 text-sm font-black text-primary transition hover:-translate-y-1 hover:shadow-xl"
          >
            ثبت درخواست <TbArrowLeft size={19} />
          </Link>
        </div>
      </div>
    </section>
  )
}
