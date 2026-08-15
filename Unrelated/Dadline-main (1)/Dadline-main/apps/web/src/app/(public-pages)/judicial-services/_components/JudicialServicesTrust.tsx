import { TbShieldLock } from "react-icons/tb"
import { trustItems } from "../_data/judicial-services"
import SectionHeading from "./SectionHeading"

const JudicialServicesTrust = () => (
  <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="اعتماد و اطمینان"
        title="خدمات قضایی ساخته‌شده برای امنیت و آرامش شما"
        description="هر مرحله از فرایند روشن، قابل پیگیری و همراه با راهنمایی تخصصی طراحی شده است تا بدون سردرگمی، درخواست قضایی خود را ثبت کنید."
        icon={<TbShieldLock aria-hidden size={18} />}
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden size={23} />
              </div>
              <h3 className="mt-5 text-base font-black text-gray-950 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  </section>
)

export default JudicialServicesTrust
