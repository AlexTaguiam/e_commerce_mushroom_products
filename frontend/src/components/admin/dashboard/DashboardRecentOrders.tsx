import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";

interface OrderRow {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "shipped";
}

export function DashboardRecentOrders() {
  const recentOrders: OrderRow[] = [
    {
      id: "ORD-9021",
      customer: "Jared Terry",
      date: "Aug 04, 2026",
      amount: "₱1,250.00",
      status: "paid",
    },
    {
      id: "ORD-9020",
      customer: "Jasmine Kuhlman",
      date: "Aug 04, 2026",
      amount: "₱3,400.00",
      status: "pending",
    },
    {
      id: "ORD-9019",
      customer: "Peoria Jaeger",
      date: "Aug 03, 2026",
      amount: "₱850.00",
      status: "shipped",
    },
    {
      id: "ORD-9018",
      customer: "Cedar Botsford",
      date: "Aug 02, 2026",
      amount: "₱2,100.00",
      status: "paid",
    },
  ];

  return (
    <div className="bg-white border border-[#e5dfd3] rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#2d4029]">
            Recent Orders
          </h2>
          <p className="text-xs text-stone-400 font-medium">
            Latest client purchases requiring fulfillment
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-xs font-bold text-[#4c6a46] hover:text-[#2d4029] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e5dfd3] text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <th className="py-3 px-2">Order ID</th>
              <th className="py-3 px-2">Customer</th>
              <th className="py-3 px-2">Date</th>
              <th className="py-3 px-2">Total</th>
              <th className="py-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4efe6] text-xs">
            {recentOrders.map((ord) => (
              <tr
                key={ord.id}
                className="hover:bg-[#faf8f4] transition-colors group"
              >
                <td className="py-3 px-2 font-mono font-bold text-[#2d4029]">
                  <Link
                    to={`/admin/orders`}
                    className="hover:underline flex items-center gap-1"
                  >
                    {ord.id}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4c6a46]" />
                  </Link>
                </td>
                <td className="py-3 px-2 font-semibold text-stone-700">
                  {ord.customer}
                </td>
                <td className="py-3 px-2 text-stone-400 font-medium">
                  {ord.date}
                </td>
                <td className="py-3 px-2 font-serif font-bold text-[#2d4029]">
                  {ord.amount}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      ord.status === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ord.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {ord.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
