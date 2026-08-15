import type { ReactNode } from 'react'

type Props = {
    title: string
    description: string
    action?: ReactNode
}

const AdminPageHeader = ({ title, description, action }: Props) => (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-black text-gray-950 dark:text-white">
                {title}
            </h1>
            <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
                {description}
            </p>
        </div>
        {action}
    </div>
)

export default AdminPageHeader
