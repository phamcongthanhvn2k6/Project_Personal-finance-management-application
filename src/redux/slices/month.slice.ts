// ✅ Import createSlice để tạo slice Redux
// ✅ Import PayloadAction để định nghĩa kiểu dữ liệu cho action
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


// ✅ Định nghĩa kiểu dữ liệu cho state của slice này
interface MonthState {
  selectedMonth: string; // Lưu tháng đang được chọn theo format `YYYY-MM`
}


// ✅ State ban đầu khi ứng dụng chạy
const initialState: MonthState = {
  // Lấy tháng hiện tại theo ISO dạng YYYY-MM-DDTHH:MM:SSZ
  // → .slice(0, 7) cắt chỉ còn YYYY-MM
  // Ví dụ: "2025-10"
  selectedMonth: new Date().toISOString().slice(0, 7),
};


// ✅ Tạo Redux slice tên là "month"
const monthSlice = createSlice({
  name: "month",        // Tên slice ⇒ xuất hiện trong Redux DevTools
  initialState,         // State mặc định
  reducers: {
    /**
     * ✅ setMonth
     * Nhận payload: string (ví dụ "2025-12")
     * Cập nhật state.selectedMonth sang giá trị mới
     */
    setMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
  },
});

// ✅ Export action để dispatch từ Component
export const { setMonth } = monthSlice.actions;

// ✅ Export reducer để đưa vào store
export default monthSlice.reducer;
