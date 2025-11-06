// ✅ Khai báo kiểu dữ liệu cho props Component
interface StatsCardProps {
  title: string;      // Tiêu đề của card (ví dụ: "Total Revenue")
  value: string;      // Giá trị chính hiển thị (ví dụ: "$20,000")
  change: string;     // Tỉ lệ thay đổi (ví dụ: "+12%")
  positive?: boolean; // ✅ Optional: true -> màu xanh, false -> màu đỏ
}

// ✅ Component StatsCard nhận props và render UI
export default function StatsCard({ title, value, change, positive }: StatsCardProps) {
  return (
    // ✅ Container của card: màu trắng, bo góc, có shadow
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition">
      
      {/* ✅ Tiêu đề nhỏ phía trên */}
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>

      {/* ✅ Giá trị chính (to, đậm) */}
      <p className="text-2xl font-bold text-gray-800">{value}</p>

      {/* ✅ Hiển thị phần trăm thay đổi màu xanh hoặc đỏ */}
      <p
        className={`text-sm mt-2 font-medium ${
          positive ? "text-green-500" : "text-red-500"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
