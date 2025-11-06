/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { upsertMonthlyCategory } from "../../../redux/slices/monthlyCategory.slice";
import { setMonth } from "../../../redux/slices/month.slice";
import { fetchTransactions } from "../../../redux/slices/transaction.slice";

import type { AppDispatch, RootState } from "../../../redux/store";
import { Apis } from "../../../apis";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function BudgetSection() {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const selectedMonth = useSelector((state: RootState) => state.month.selectedMonth);
  const transactions = useSelector((state: RootState) => state.transactions.list);

  const location = useLocation();

  const [balence, setBalence] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ LOAD DỮ LIỆU KHI ĐỔI THÁNG
  useEffect(() => {
    if (!user || !selectedMonth) return;

    (async () => {
      try {
        const monthlyData = await Apis.monthlyCategory.getByUserAndMonth(
          user.id,
          selectedMonth
        );

        if (!monthlyData) {
          setBalence(0);
          return;
        }

        const balance = monthlyData.balence ?? 0;
        setBalence(balance);

        // ✅ Load giao dịch của tháng đó để tính chi tiêu
        dispatch(fetchTransactions(monthlyData.id));

      } catch (error) {
        console.error("Lỗi tải thu nhập tháng:", error);
      }
    })();
  }, [user, selectedMonth, dispatch]);

  // ✅ TỐI ƯU: TÍNH TỔNG CHI TIÊU CHỈ KHI transactions THAY ĐỔI
  const spent = useMemo(() => {
    return transactions.reduce((acc, t) => acc + Number(t.total ?? 0), 0);
  }, [transactions]);

  // ✅ TÍNH TIỀN CÒN LẠI (không dùng setState để tránh re-render thừa)
  const remaining = useMemo(() => {
    return Math.max(balence - spent, 0);
  }, [balence, spent]);

  // ✅ CHỈ NHẬP SỐ
  const handleBalenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    setBalence(cleaned ? Number(cleaned) : 0);
  };

  // ✅ LƯU LÊN SERVER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedMonth) {
      setMessage("⚠️ Vui lòng chọn tháng");
      return;
    }

    try {
      await dispatch(
        upsertMonthlyCategory({
          userId: user.id,
          month: selectedMonth,
          balence,
        })
      ).unwrap();

      setMessage("✅ Lưu thành công!");
    } catch {
      setMessage("❌ Lưu thất bại");
    }

    setTimeout(() => setMessage(null), 2000);
  };

  const hideBudgetBox =
    location.pathname.includes("categories") ||
    location.pathname.includes("history");

  return (
    <div className="w-[768px] mx-auto flex flex-col gap-5 text-center">
      <h2 className="text-xl font-semibold text-indigo-700 flex items-center justify-center gap-2">
        📊 Quản Lý Tài Chính Cá Nhân
      </h2>

      {/* ✅ Thông báo */}
      {message && (
        <p
          className={`text-sm ${
            message.includes("✅") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      {/* ✅ SỐ TIỀN CÒN LẠI */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center">
        <p className="text-sm text-gray-500 mb-2">Số tiền còn lại</p>

        <p
          className={`text-2xl font-semibold ${
            remaining > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {remaining.toLocaleString("vi-VN")} VND
        </p>
      </div>

      {/* ✅ CHỌN THÁNG */}
      <div className="bg-white shadow-lg rounded-2xl p-4 flex justify-center items-center gap-2">
        <label className="text-sm text-gray-700 flex items-center gap-2">
          📅 Chọn tháng:
        </label>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => dispatch(setMonth(e.target.value))}
          className="border rounded-lg p-2 w-56 text-sm text-center focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* ✅ INPUT NHẬP THU NHẬP */}
      {!hideBudgetBox && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-4 flex items-center justify-center gap-3"
        >
          <label className="text-sm text-gray-700 flex items-center gap-2">
            💰 Nguồn thu tháng:
          </label>

          <input
            type="text"
            inputMode="numeric"
            placeholder="VD: 5,000,000"
            value={balence === 0 ? "" : balence.toLocaleString("vi-VN")}
            onChange={handleBalenceChange}
            className="border rounded-lg p-2 w-56 text-sm text-center focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Lưu
          </button>
        </form>
      )}
    </div>
  );
}
