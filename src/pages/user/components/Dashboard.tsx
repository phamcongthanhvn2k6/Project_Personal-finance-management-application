import BudgetSection from "./BudgetSection";
import ProfileSection from "./ProfileSection";

export default function Dashboard() {
  return (
    // 🔹 Layout chính của Dashboard
    <div className="flex flex-col gap-6 w-[768px] mx-auto mt-0.5  ">
      {/* 🔷 Header chào mừng / mô tả */}
      <div className="bg-indigo-600 text-white rounded-lg shadow-md p-5 text-center">
        <h1 className="text-xl font-semibold">💡 Kiểm Soát Chi Tiêu Thông Minh</h1>
        <p className="text-sm mt-1 text-indigo-100">
          Theo dõi ngân sách và quản lý chi tiêu hàng tháng của bạn một cách dễ dàng.
        </p>
      </div>

      {/* 🔹 Khu vực ngân sách */}
      <BudgetSection />

      {/* 🔹 Khu vực thông tin cá nhân */}
      <ProfileSection />
    </div>
  );
}
