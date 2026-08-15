const TableEmpty = ({ message = 'داده‌ای برای نمایش وجود ندارد.' }: { message?: string }) => (
    <div className="p-8 text-center text-sm text-gray-500">{message}</div>
)

export default TableEmpty
