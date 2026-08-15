import type { ReactNode } from 'react'

type Props = {
    title: string
    value: string
    hint?: string
    icon: ReactNode
}

const StatCard = ({ title, value, hint, icon }: Props) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {title}
                </p>
                <p className="mt-3 text-2xl font-black text-gray-950 dark:text-white">
                    {value}
                </p>
                {hint && (
                    <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                        {hint}
                    </p>
                )}
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                {icon}
            </span>
        </div>
    </div>
)

export default StatCard
