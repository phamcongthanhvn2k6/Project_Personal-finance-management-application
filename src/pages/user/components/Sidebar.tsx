import { NavLink } from "react-router-dom";
import { Info, Layers, History } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-52 min-h-[calc(100vh-56px)] p-3">
      <nav className="flex flex-col gap-3 mt-2">
        {/* 🟦 Information */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 border rounded px-3 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-md" // 🔵 Màu khi active
                : "border-blue-600 text-blue-600 hover:bg-blue-50" // ⚪ Màu khi bình thường
            }`
          }
        >
          <Info size={16} />
          Information
        </NavLink>

        {/* 🟧 Category */}
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `flex items-center gap-2 border rounded px-3 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          <Layers size={16} />
          Category
        </NavLink>

        {/* 🟩 History */}
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-2 border rounded px-3 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          <History size={16} />
          History
        </NavLink>
      </nav>
    </aside>
  );
}
