import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type: "warning" | "success" | "info" | "error";
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colorMap = {
    warning: "text-yellow-400",
    success: "text-green-400",
    info: "text-blue-400",
    error: "text-red-400",
  };

  const iconMap = {
    warning: <AlertTriangle className={colorMap[type]} size={22} />,
    success: <CheckCircle2 className={colorMap[type]} size={22} />,
    info: <Info className={colorMap[type]} size={22} />,
    error: <XCircle className={colorMap[type]} size={22} />,
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-[fadeIn_0.3s]">
      <div className="bg-[#263556] text-white rounded-xl px-6 py-4 shadow-lg flex gap-3 items-start max-w-sm">
        {iconMap[type]}
        <div className="text-sm opacity-90">{message}</div>
      </div>
    </div>
  );
}

export default Toast;
