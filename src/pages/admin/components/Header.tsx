import { UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="app-header fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-6"
            style={{ height: '56px' }}>
      {/* Left: logo */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-800">Financial <span className="text-indigo-600">Manager</span></span>
      </div>

      {/* Right: user Icon */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <UserCircle className="h-6 w-6" />
        </button>

      </div>
    </header>
  );
}
