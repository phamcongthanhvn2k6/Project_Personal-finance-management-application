import { useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// -----------------------------
// ✅ Data mô phỏng thống kê 12 tháng
// -----------------------------
const data12 = [
  { month: "Jan", value: 20000 },
  { month: "Feb", value: 24000 },
  { month: "Mar", value: 31000 },
  { month: "Apr", value: 35000 },
  { month: "May", value: 42000 },
  { month: "Jun", value: 45591 },
  { month: "Jul", value: 47000 },
  { month: "Aug", value: 49000 },
  { month: "Sep", value: 52000 },
  { month: "Oct", value: 56000 },
  { month: "Nov", value: 58000 },
  { month: "Dec", value: 61000 },
];

// ✅ Lấy 6 tháng gần nhất bằng slice
const data6 = data12.slice(-6);

// ✅ Data mô phỏng 30 ngày
const data30day = [
  { day: "01", value: 4000 },
  { day: "05", value: 6000 },
  { day: "10", value: 9000 },
  { day: "15", value: 12000 },
  { day: "20", value: 15000 },
  { day: "25", value: 18000 },
  { day: "30", value: 20000 },
];

// ✅ Data mô phỏng 7 ngày
const data7day = [
  { day: "Mon", value: 2000 },
  { day: "Tue", value: 3000 },
  { day: "Wed", value: 5000 },
  { day: "Thu", value: 4500 },
  { day: "Fri", value: 6000 },
  { day: "Sat", value: 7000 },
  { day: "Sun", value: 8000 },
];

// ------------------------------------------------
// ✅ Component chính
// ------------------------------------------------
export default function ChartSection() {
  // ✅ Trạng thái lựa chọn kiểu biểu đồ
  // → mặc định hiển thị 12 tháng
  const [activeType, setActiveType] = useState<"12M" | "6M" | "30D" | "7D">("12M");

  // ✅ Xác định data cần hiển thị dựa vào nút đang chọn
  const chartData =
    activeType === "12M"
      ? data12
      : activeType === "6M"
      ? data6
      : activeType === "30D"
      ? data30day
      : data7day;

  // ✅ Trục X dùng "month" hoặc "day" tùy chế độ
  const labelKey = activeType === "12M" || activeType === "6M" ? "month" : "day";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* ------------------ Header ------------------ */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-700 font-semibold">Report Money</h3>

        {/* Nút điều khiển đổi chế độ */}
        <div className="flex items-center gap-2">
          {[
            { key: "12M", label: "12 Months" },
            { key: "6M", label: "6 Months" },
            { key: "30D", label: "30 Days" },
            { key: "7D", label: "7 Days" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveType(btn.key as any)} // ✅ đổi state để đổi biểu đồ
              className={`px-3 py-1 border rounded-md text-sm ${
                activeType === btn.key
                  ? "bg-indigo-500 text-white border-indigo-500" // ✅ nút đang active
                  : "text-gray-600"
              }`}
            >
              {btn.label}
            </button>
          ))}

          {/* ✅ Nút export PDF (chưa xử lý) */}
          <button className="px-3 py-1 border rounded-md text-sm text-gray-700">
            Export PDF
          </button>
        </div>
      </div>

      {/* ------------------ Chart container ------------------ */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData} // ✅ data tùy theo chế độ
            margin={{ top: 20, right: 24, left: 0, bottom: 0 }}
          >
            {/* ✅ gradient màu cho line */}
            <defs>
              <linearGradient id="gradLine" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                <stop offset="100%" stopColor="#4338CA" stopOpacity={1} />
              </linearGradient>
            </defs>

            {/* ✅ grid nhẹ để biểu đồ đẹp hơn */}
            <CartesianGrid stroke="#F3F4F6" vertical={false} />

            {/* ✅ trục X: dùng key linh hoạt (month/day) */}
            <XAxis dataKey={labelKey} stroke="#9CA3AF" />

            {/* ✅ trục Y */}
            <YAxis stroke="#9CA3AF" />

            {/* ✅ tooltip hiển thị khi hover */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
              }}
              // ✅ formatter đổi số -> $12,000
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
            />

            {/* ✅ biểu đồ Line */}
            <Line
              type="monotone"
              dataKey="value" // ✅ giá trị cần vẽ
              stroke="url(#gradLine)" // ✅ dùng gradient ở trên
              strokeWidth={3}
              dot={{ r: 4, stroke: "#4338CA", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
