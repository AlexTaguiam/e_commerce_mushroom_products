export function DashboardStatusDonut() {
  const statuses = [
    {
      label: "Completed / Paid",
      percentage: "68%",
      count: "873",
      color: "bg-[#4c6a46]",
    },
    {
      label: "Pending Processing",
      percentage: "22%",
      count: "282",
      color: "bg-amber-500",
    },
    {
      label: "Shipped / En Route",
      percentage: "10%",
      count: "129",
      color: "bg-stone-400",
    },
  ];

  return (
    <div className="bg-white border border-[#e5dfd3] rounded-3xl p-6 shadow-sm space-y-5">
      <div>
        <h2 className="font-serif font-bold text-lg text-[#2d4029]">
          Fulfillment Ratio
        </h2>
        <p className="text-xs text-stone-400 font-medium">
          Order status allocation across active logs
        </p>
      </div>

      {/* SVG Donut Graphic */}
      <div className="relative flex items-center justify-center py-2">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-stone-100"
            strokeWidth="3.8"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Segment 1: Paid (68%) */}
          <path
            className="text-[#4c6a46]"
            strokeDasharray="68, 100"
            strokeWidth="3.8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Segment 2: Pending (22%) */}
          <path
            className="text-amber-500"
            strokeDasharray="22, 100"
            strokeDashoffset="-68"
            strokeWidth="3.8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif font-bold text-xl text-[#2d4029]">
            1,284
          </span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Legend Rows */}
      <div className="space-y-2 pt-2 border-t border-[#f0ebe1]">
        {statuses.map((st, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
              <span className="font-medium text-stone-600">{st.label}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-stone-400 text-[11px]">{st.count}</span>
              <span className="text-[#2d4029] font-serif">{st.percentage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
