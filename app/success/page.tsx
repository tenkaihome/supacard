"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const savedQueue = localStorage.getItem("supa_queue");
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue);
        setQueueCount(queue.length);
      } catch(e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_12px_32px_rgba(123,44,191,0.1)] p-10 text-center">
        <h2 className="text-gray-900 text-2xl font-semibold mb-4">Hoàn tất một thẻ!</h2>
        <p className="text-gray-600 mb-6">
          Bằng cách chuyển hướng thực tế sang trang này, Chrome sẽ hiểu bạn vừa mua hàng thành công và sẽ hiển thị hộp thoại lưu thẻ tại đây một cách tự nhiên nhất.
        </p>
        
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm font-medium text-[#5a189a]">
            Bạn vui lòng ấn Lưu trên hộp thoại của Chrome nhé.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Số thẻ đang chờ: {queueCount} thẻ
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full p-4 bg-[#7b2cbf] hover:bg-[#5a189a] text-white rounded-xl text-base font-semibold transition-colors active:scale-95"
        >
          {queueCount > 0 ? "Tiếp tục nhập thẻ tiếp theo" : "Trở về trang chủ"}
        </button>
      </div>
    </div>
  );
}
