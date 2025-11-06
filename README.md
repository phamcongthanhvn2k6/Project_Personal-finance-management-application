🚀 Transaction Management App (React + Redux Toolkit + Token Auth)
✅ 1. Giới thiệu dự án

Dự án cho phép người dùng quản lý danh sách giao dịch (Transaction) gồm:

✅ Lấy danh sách (GET)

✅ Thêm mới (POST)

✅ Cập nhật không cần tải lại trang (PATCH)

✅ Xoá theo ID (DELETE)

✅ Lưu trạng thái bằng Redux Toolkit

✅ Bảo mật bằng Token Authorization

✅ 2. Công nghệ sử dụng
Công nghệ            	| Mục đích
ReactJS	              | Xây UI Component
Redux Toolkit        	| Quản lý state tập trung
Axios                 |	Gọi API backend
createAsyncThunk      |	Xử lý bất đồng bộ và CRUD API
LocalStorage Token    |	Lưu đăng nhập & gửi Authorization mỗi request
useContext	          |Truyền dữ liệu giữa component không cần props
useMemo / useCallback |	Tối ưu re-render
✅ 3. Cơ chế hoạt động Token

Khi đăng nhập thành công, Backend trả về:

{
  "access_token": "abcxyz123"
}


Frontend lưu token:

localStorage.setItem("token", result.access_token);


Khi gọi API, client tự gắn token:

const token = localStorage.getItem("token");

axios.get("/api/transactions", {
  headers: { Authorization: `Bearer ${token}` }
});


➡ Nhờ vậy backend biết request thuộc user nào.

✅ 4. Cấu trúc thư mục
src/
├─ redux/
│  ├─ store.ts
│  └─ slices/
│     └─ transaction.slice.ts
├─ components/
│  ├─ AddTransactionForm.jsx
│  └─ TransactionList.jsx
└─ App.jsx

✅ 5. Redux Toolkit: createAsyncThunk

Dùng để gọi API bất đồng bộ như GET, POST, PUT, DELETE.

Ví dụ thêm transaction:

export const addTransaction = createAsyncThunk(
  "transaction/addTransaction",
  async (data, thunkAPI) => {
    const token = localStorage.getItem("token");
    const res = await axios.post("http://localhost:5000/api/transactions", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
);

✅ 6. Giải thích createAsyncThunk
Trạng thái	Ý nghĩa
pending	Đang chờ API → bật loading
fulfilled	API thành công → cập nhật state
rejected	API lỗi → bật error

Ví dụ xử lý:

builder
  .addCase(addTransaction.pending, (state) => {
    state.loading = true;
  })
  .addCase(addTransaction.fulfilled, (state, action) => {
    state.loading = false;
    state.list.push(action.payload);
  })
  .addCase(addTransaction.rejected, (state) => {
    state.loading = false;
    state.error = true;
  });


✅ Không cần setState thủ công
✅ Không reload trang
✅ Redux tự quản lý state

✅ 7. Toàn bộ file transaction.slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

// GET
export const fetchTransactions = createAsyncThunk(
  "transaction/fetchTransactions",
  async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
);

// ADD
export const addTransaction = createAsyncThunk(
  "transaction/addTransaction",
  async (data) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
);

// UPDATE
export const updateTransaction = createAsyncThunk(
  "transaction/updateTransaction",
  async ({ id, data }) => {
    const token = localStorage.getItem("token");
    const res = await axios.patch(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
);

// DELETE
export const deleteTransaction = createAsyncThunk(
  "transaction/deleteTransaction",
  async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return id;
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    list: [],
    loading: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })

      // ADD
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // UPDATE
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t.id === action.payload.id);
        state.list[idx] = action.payload;
      })

      // DELETE
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.list = state.list.filter(item => item.id !== action.payload);
      })
  },
});

export default transactionSlice.reducer;

✅ 8. Luồng hoạt động CRUD (quan trọng)
Hành động	Chuyện gì xảy ra
1️⃣ User nhấn "Add"	gọi dispatch(addTransaction())
2️⃣ Redux gửi request API có Token	Backend lưu DB
3️⃣ Thành công → phần fulfilled chạy	Redux push dữ liệu mới vào state
✅ UI cập nhật ngay	Không reload trang
✅ 9. Ví dụ Component: AddTransactionForm.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTransaction } from "../redux/slices/transaction.slice";

export default function AddTransactionForm() {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(addTransaction({ text, amount }));
  };

  return (
    <div>
      <input onChange={(e) => setText(e.target.value)} placeholder="Name" />
      <input onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}

✅ 10. Example useContext
import { createContext, useContext } from "react";

const ThemeContext = createContext();

export function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  );
}

function Child() {
  const theme = useContext(ThemeContext);
  return <p>Theme đang dùng: {theme}</p>;
}


✅ Không cần truyền props thủ công

✅ 11. useCallback vs useMemo
Hook	Dùng cho	Lợi ích
useCallback	Ghi nhớ function	Chỉ tạo function mới khi dependency thay đổi
useMemo	Ghi nhớ kết quả của tính toán	Không tính lại khi không cần thiết

Ví dụ:

const total = useMemo(() => items.reduce((a,b) => a + b), [items]);

const handleClick = useCallback(() => {
  console.log("clicked");
}, []);

✅ 12. Hướng dẫn chạy dự án
npm install
npm start

✅ 13. Lợi ích tổng quan

✅ Không reload trang khi thêm/sửa/xoá
✅ API có Token an toàn
✅ Redux Toolkit cực gọn, dễ quản lý
✅ UI phản hồi nhanh vì update state trực tiếp
