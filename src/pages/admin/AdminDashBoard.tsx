// ✅ React hook useState để tạo state, useEffect để gọi API khi load trang
import { useEffect, useState } from "react";

// ✅ Import các component giao diện
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StatsCard from "./components/StatsCard";
import ChartSection from "./components/ChartSection";
import RecentCustomers from "./components/RecentCustomers";

/* eslint-disable @typescript-eslint/no-explicit-any */
// ✅ Tắt cảnh báo TypeScript với kiểu any (tránh lỗi khi gọi JSON)
export default function DashboardAdmin() {

  // ✅ State lưu số lượng người dùng
  const [usersCount, setUsersCount] = useState(0);

  // ✅ State lưu số lượng danh mục
  const [categoriesCount, setCategoriesCount] = useState(0);

  // ✅ State lưu số lượng giao dịch (không tính tiền)
  const [transactionsCount, setTransactionsCount] = useState(0);

  // ✅ Tổng tiền (balance) trong tất cả monthlyCategories
  const [totalMoney, setTotalMoney] = useState(0);

  // ✅ useEffect sẽ chạy 1 lần khi component render lần đầu
  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Promise.all cho phép gọi song song 4 API
        const [usersRes, categoriesRes, transactionsRes, monthlyCateRes] =
          await Promise.all([
            fetch("http://localhost:3001/users"),
            fetch("http://localhost:3001/categories"),
            fetch("http://localhost:3001/transactions"),
            fetch("http://localhost:3001/monthlyCategories"),
          ]);

        // ✅ Chuyển response thành JSON
        const users = await usersRes.json();
        const categories = await categoriesRes.json();
        const transactions = await transactionsRes.json();
        const monthlyCategories = await monthlyCateRes.json();

        // ✅ 1. Tổng số user
        setUsersCount(users.length);

        // ✅ 2. Tổng số categories
        setCategoriesCount(categories.length);

        // ✅ 3. Tổng số giao dịch
        setTransactionsCount(transactions.length);

        // ✅ 4. Tổng balance từ monthlyCategories
        //    - Dùng reduce để cộng dồn
        //    - Dự phòng trường hợp backend trả về "balence" hoặc "balance"
        const sumMoney = monthlyCategories.reduce(
          (sum: number, item: any) =>
            sum + Number(item.balence || item.balance || 0),
          0
        );

        setTotalMoney(sumMoney);

      } catch (error) {
        console.error("❌ Lỗi lấy dữ liệu Dashboard:", error);
      }
    }

    // ✅ Gọi hàm fetch
    fetchData();
  }, []); // ✅ [] nghĩa là chỉ chạy 1 lần sau khi mount

  return (
    // ✅ Bố cục chính tổng thể
    <div className="min-h-screen bg-gray-50 flex">

      {/* ✅ Sidebar bên trái */}
      <Sidebar />

      {/* ✅ Nội dung bên phải */}
      <div className="flex-1 ml-60">
        
        {/* ✅ Header (thanh top) */}
        <Header />

        {/* ✅ Vùng nội dung */}
        <main className="pt-20 px-8">

          {/* ✅ 4 ô thống kê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* ✅ USERS */}
            <StatsCard
              title="USERS"
              value={usersCount.toString()}
              change="+36%"
              positive
            />

            {/* ✅ CATEGORY */}
            <StatsCard
              title="CATEGORY"
              value={categoriesCount.toString()}
              change="-14%"
            />

            {/* ✅ SPENDING RECORDS */}
            <StatsCard
              title="SPENDING (Records)"
              value={transactionsCount.toString()}
              change="+12%"
              positive
            />

            {/* ✅ Tổng tiền format theo tiền VNĐ */}
            <StatsCard
              title="TOTAL MONEY"
              value={totalMoney.toLocaleString() + " ₫"}
              change="+36%"
              positive
            />
          </div>

          {/* ✅ Biểu đồ + danh sách khách hàng gần đây */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ✅ Biểu đồ chiếm 2 cột lớn */}
            <div className="lg:col-span-2">
              <ChartSection />
            </div>

            {/* ✅ Danh sách khách hàng gần đây (giả lập) */}
            <RecentCustomers />
          </div>
        </main>
      </div>
    </div>
  );
}
