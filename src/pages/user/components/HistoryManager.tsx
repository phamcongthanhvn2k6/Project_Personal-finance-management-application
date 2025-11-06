/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../redux/store";
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  resetTransactions, // ✅ thêm action reset
} from "../../../redux/slices/transaction.slice";
import { fetchMonthlyCategories } from "../../../redux/slices/monthlyCategory.slice";
import Toast from "./Toast";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HistoryManager() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Form nhập dữ liệu
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  // ✅ Toast thông báo
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: string }>({
    show: false,
    message: "",
    type: "warning",
  });

  const showToast = (msg: string, type: "success" | "warning" | "error" = "warning") => {
    setToast({ show: true, message: msg, type });
  };

  // ✅ Phân trang giao dịch
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Lấy dữ liệu từ Redux
  const selectedMonth = useSelector((state: RootState) => state.month.selectedMonth);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const monthly = useSelector((state: RootState) => state.monthlyCategories);
  const transactions = useSelector((state: RootState) => state.transactions);

  // ✅ Luôn fetch lại ngân sách tháng mỗi khi user hoặc tháng thay đổi
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchMonthlyCategories(currentUser.id));
    }
  }, [currentUser, selectedMonth, dispatch]);

  // ✅ Xác định đúng record tháng (theo selectedMonth từ Redux)
  const currentMonthly = monthly.list.find((m) => m.month === selectedMonth);
  const monthlyId = currentMonthly?.id ?? "";

  // ✅ Mỗi khi đổi tháng → Reset giao dịch cũ và load giao dịch tháng mới
  useEffect(() => {
    dispatch(resetTransactions()); // ✅ Xóa dữ liệu cũ, tránh hiển thị sai
    if (monthlyId) {
      dispatch(fetchTransactions(monthlyId));
    }
  }, [monthlyId, selectedMonth, dispatch]);

  // ✅ Thêm giao dịch
  const handleAdd = async () => {
    if (!amount || !categoryId || !monthlyId|| !currentUser) {
      showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
      return
    }

    const category = currentMonthly?.categories.find((c: any) => c.categoryId === categoryId);

    if (!category) {
      showToast("Danh mục không hợp lệ!", "error");
      return;
    }

    const budget = category.budget || 0;

    const spent = transactions.list
      .filter((t) => t.categoryId === categoryId)
      .reduce((sum, t) => sum + (t.total || 0), 0);

      const newTotal = spent + Number(amount);

    if (newTotal > budget) {
      showToast(`Vượt quá ngân sách của danh mục này! (Ngân sách: ${budget.toLocaleString("vi-VN")} đ)`, "error");
      return;
    }



    dispatch(addTransaction({
      createdDate: new Date().toISOString(),
      categoryId,
      total: Number(amount),
      description: note,
      monthlyCategoryId: monthlyId,
    }));

    setAmount("");
    setCategoryId("");
    setNote("");

    showToast("Thêm giao dịch thành công!", "success");
  }

  // ✅ Tổng tiền đã tiêu trong tháng
  const totalSpent = useMemo(() => {
    return transactions.list.reduce((sum, t) => sum + (t.total || 0), 0);
  }, [transactions.list]);

  // ✅ Tổng ngân sách của tháng
  const totalBudget = useMemo(() => {
    const sum = (currentMonthly?.categories || []).reduce(
      (acc: number, c: any) => acc + (c.budget || 0),
      0
    );
    return sum;
  }, [currentMonthly]);

  const remaining = totalBudget - totalSpent;

  // ✅ Reset trang khi đổi tháng
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  // ✅ Pagination xử lý splash lỗi
  const totalItems = transactions.list.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentList = transactions.list.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ✅ Form nhập giao dịch */}
      <div className="bg-white shadow-md rounded-xl p-4 flex gap-3 items-center mb-6">
        <input
          type="number"
          placeholder="Số tiền"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg p-2 flex-1 text-sm focus:ring-2 focus:ring-indigo-500"
        />

        <select
          className="border rounded-lg p-2 flex-1 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Chọn danh mục</option>
          {(currentMonthly?.categories || []).map((c: any) => (
            <option key={c.id} value={c.categoryId}>
              {c.category?.name || c.categoryId}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border rounded-lg p-2 flex-1 text-sm focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Thêm
        </button>
      </div>

      {/* ✅ Lịch sử giao dịch */}
      <div className="bg-white p-5 rounded-xl shadow-lg">
        <h2 className="font-semibold text-gray-800 mb-4">
          📑 Lịch sử giao dịch tháng {selectedMonth}
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b border-gray-200">
              <th className="p-2">STT</th>
              <th className="p-2">Danh mục</th>
              <th className="p-2">Số tiền</th>
              <th className="p-2">Ghi chú</th>
              <th className="p-2 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {currentList.length > 0 ? (
              currentList.map((t, index) => {
                const cat = currentMonthly?.categories?.find(
                  (c: any) => c.categoryId === t.categoryId
                );

                return (
                  <tr
                    key={t.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-2">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-2">{cat?.category?.name || "Không xác định"}</td>
                    <td className="p-2">{t.total.toLocaleString("vi-VN")} đ</td>
                    <td className="p-2">{t.description}</td>
                    <td
                      className="p-2 text-center cursor-pointer hover:text-red-600"
                      onClick={() => dispatch(deleteTransaction(t.id))}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-4">
                  Không có giao dịch trong tháng này
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center mt-6">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 shadow-sm">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium transition border ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-indigo-100 text-indigo-600"
                }`}
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition border ${
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium transition border ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-indigo-100 text-indigo-600"
                }`}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Hiển thị Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type as any}
          onClose={() => setToast({ show: false, message: "", type: "warning" })}
        />
      )}
    </div>
  );
}
