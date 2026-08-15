import { PiChartLineUpDuotone, PiShieldCheckDuotone, PiUsersThreeDuotone } from 'react-icons/pi'
import type { CommonProps } from '@/@types/common'

const features = [
    {
        icon: PiShieldCheckDuotone,
        title: 'دسترسی چندلایه',
        description: 'نقش، ability و کلید سرور',
    },
    {
        icon: PiChartLineUpDuotone,
        title: 'گزارش مالی',
        description: 'درآمد، هزینه و کیف پول',
    },
    {
        icon: PiUsersThreeDuotone,
        title: 'عملیات سامانه',
        description: 'کاربران و خدمات حقوقی',
    },
]

const Side = ({ children }: CommonProps) => (
    <div className="flex min-h-full bg-white p-4 dark:bg-gray-950 sm:p-6">
        <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[430px] px-4 sm:px-8">{children}</div>
        </div>
        <aside className="relative hidden max-w-[680px] flex-1 overflow-hidden rounded-[2rem] bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,#1d4ed8_0,transparent_32%),radial-gradient(circle_at_80%_70%,#0f766e_0,transparent_28%)]" />
            <div className="relative">
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-blue-200">
                    Dadline Administration
                </span>
                <h2 className="mt-8 max-w-xl text-4xl font-black leading-[1.6]">
                    کنترل یکپارچه عملکرد مالی و عملیاتی دادلاین
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-8 text-gray-300">
                    داشبورد داخلی برای پایش کاربران، تراکنش‌ها، درآمد و هزینه، درخواست‌های خدمات و تنظیمات زیرساخت؛ با دسترسی محدود به مدیر سیستم.
                </p>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-3">
                {features.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <Icon className="text-2xl text-blue-300" />
                        <div className="mt-4 font-black">{title}</div>
                        <div className="mt-2 text-xs leading-6 text-gray-400">{description}</div>
                    </div>
                ))}
            </div>
        </aside>
    </div>
)

export default Side
