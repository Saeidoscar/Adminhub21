import classNames from 'classnames'

const success = ['completed', 'accepted', 'paid', 'fulfilled', 'answered', 'active', 'signed', 'finished']
const warning = ['pending', 'processing', 'submitted', 'calling', 'offer', 'handling', 'referred', 'draft']
const danger = ['failed', 'cancelled', 'canceled', 'rejected', 'returned', 'refunded', 'closed']

const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
    <span
        className={classNames(
            'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
            success.includes(status) && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
            warning.includes(status) && 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
            danger.includes(status) && 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
            !success.includes(status) && !warning.includes(status) && !danger.includes(status) &&
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        )}
    >
        {label ?? status}
    </span>
)

export default StatusBadge
