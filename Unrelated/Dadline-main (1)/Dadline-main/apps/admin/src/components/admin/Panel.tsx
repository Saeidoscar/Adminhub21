import type { ReactNode } from 'react'

type Props = {
    title: string
    description?: string
    children: ReactNode
    action?: ReactNode
    className?: string
}

const Panel = ({ title, description, children, action, className = '' }: Props) => (
    <section className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div>
                <h2 className="font-black text-gray-950 dark:text-white">{title}</h2>
                {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
            </div>
            {action}
        </div>
        {children}
    </section>
)

export default Panel
