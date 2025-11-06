import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App"; // 👉 App cho user
import AppAdmin from "./AppAdmin"; // 👉 App riêng cho admin
import { store } from "./redux/store";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* 🚀 App dành cho người dùng */}
          <Route path="/*" element={<App />} />

          {/* 🛠️ App dành cho admin */}
          <Route path="/admin/*" element={<AppAdmin />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
