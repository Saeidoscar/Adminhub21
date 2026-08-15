const ErrorState = ({ message }: { message: string }) => (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        {message}
    </div>
)

export default ErrorState
