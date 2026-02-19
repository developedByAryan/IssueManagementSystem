
const StatusColumn = ({ title, count, bgColor, icon, children }: any) => {
    return (
        <div className="flex-1 flex flex-col h-auto md:h-full bg-gray-50 border border-gray-300">
            <div className={`p-4 border-b border-gray-300 flex items-center justify-between ${bgColor}`}>
                <div className="flex items-center gap-2 font-semibold">
                    {icon}
                    {title}
                </div>
                <span className="bg-white px-2 py-0.5 text-xs font-bold border border-gray-300">
                    {count}
                </span>
            </div>
            <div className="p-3 flex-1 overflow-visible md:overflow-y-auto">
                {children}
                {count === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">No issues here</div>
                )}
            </div>
        </div>
    );
}

export default StatusColumn