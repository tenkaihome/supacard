"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState(false);

  const [cardQueue, setCardQueue] = useState<any[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [ccname, setCcname] = useState("");
  const [cardnumber, setCardnumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");

  // Nạp trạng thái từ trình duyệt khi vừa load trang
  useEffect(() => {
    setIsClient(true);
    
    const savedAuth = localStorage.getItem("supa_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }

    const savedQueue = localStorage.getItem("supa_queue");
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue);
        if (Array.isArray(queue) && queue.length > 0) {
          setCardQueue(queue);
          setBulkStatus(`Đang xử lý thẻ từ danh sách. Còn ${queue.length} thẻ chưa nhập.`);
          fillCardState(queue[0]);
        }
      } catch (e) {
        console.error("Queue restore error", e);
      }
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Bắt đúng mật khẩu bạn vừa set (10042026)
    if (accessCode === "10042026" || accessCode === "GbaYE5uBap3Z") {
      setIsAuthenticated(true);
      localStorage.setItem("supa_auth", "true"); // Giữ trạng thái đăng nhập kể cả khi f5
    } else {
      setAuthError(true);
    }
  };

  const clearQueue = () => {
    setCardQueue([]);
    localStorage.removeItem("supa_queue");
    setBulkStatus("Đã xóa danh sách thẻ tạm.");
    setCcname("");
    setCardnumber("");
    setExpMonth("");
    setExpYear("");
    setCvc("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      const lines = result.split("\n");
      const queue: any[] = [];
      lines.forEach((line) => {
        const parts = line.trim().split("|");
        if (parts.length >= 3) {
          queue.push({
            number: parts[0].trim(),
            month: parts[1].trim(),
            year: parts[2].trim().length === 2 ? "20" + parts[2].trim() : parts[2].trim(),
            cvv: parts[3] ? parts[3].replace(/[^0-9]/g, "") : "",
          });
        }
      });

      setCardQueue(queue);
      localStorage.setItem("supa_queue", JSON.stringify(queue));

      setBulkStatus(
        `Đã đọc ${queue.length} thẻ. Form đã sẵn sàng với thẻ đầu tiên. Ấn (Save Card) để lưu.`
      );

      if (queue.length > 0) {
        fillCardState(queue[0]);
      }
      
      // Reset input giá trị để có thể load lại file cùng tên nếu cần
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const fillCardState = (card: any) => {
    setCcname("JOHN DOE");

    // Formatting card
    let formattedValue = card.number.replace(/[^0-9]/gi, "");
    let displayVal = "";
    for (let i = 0; i < formattedValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        displayVal += " ";
      }
      displayVal += formattedValue[i];
    }
    setCardnumber(displayVal);

    setExpMonth(card.month);
    setExpYear(card.year);
    setCvc(card.cvv);
  };

  const formatCardNumber = (val: string) => {
    let value = val.replace(/[^0-9]/gi, "");
    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += " ";
      }
      formattedValue += value[i];
    }
    return formattedValue;
  };

  const handleSubmit = () => {
    // Để cho form thực sự chuyển hướng sang trang đích (NATIVE POST)
    // Chrome sẽ hiểu đây là 100% giao dịch mới mà không chặn nữa
    setIsProcessing(true);

    if (cardQueue.length > 0) {
      const newQueue = [...cardQueue];
      newQueue.shift();
      localStorage.setItem("supa_queue", JSON.stringify(newQueue));
    } else {
      localStorage.removeItem("supa_queue");
    }
  };

  // Tránh lỗi Hydration
  if (!isClient) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-[0_12px_32px_rgba(123,44,191,0.1)] p-10 text-center">
          <h2 className="mb-5 text-gray-900 text-2xl font-semibold">Yêu cầu truy cập</h2>
          <p className="mb-5 text-gray-500 text-sm">Vui lòng nhập mã khóa để tiếp tục.</p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              className="w-full p-3 mb-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all text-gray-900"
              placeholder="Nhập mã khóa (Access Code)"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
            {authError && <div className="text-red-500 text-sm mb-4">Mã khóa không đúng!</div>}
            <button
              type="submit"
              className="w-full p-4 bg-[#7b2cbf] hover:bg-[#5a189a] text-white rounded-lg font-semibold transition-colors active:scale-95"
            >
              Xác nhận
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5 font-sans">
      <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-[0_12px_32px_rgba(123,44,191,0.1)] p-10">
        <div className="text-center mb-8">
          <h2 className="text-gray-900 text-2xl font-semibold mb-2">Add Payment Card</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter your Visa card details to pay and securely save for next time.
          </p>
        </div>

        <div className="mb-6 bg-purple-50 p-4 rounded-xl border border-dashed border-[#7b2cbf]">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-[#5a189a]">Bulk Import (Format: Number|MM|YY|CVV)</p>
            {cardQueue.length > 0 && (
              <button onClick={clearQueue} className="text-red-500 hover:underline text-xs font-semibold">
                Xóa Hàng Chờ
              </button>
            )}
          </div>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="text-sm w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
          />
          {bulkStatus && (
            <div className="text-[13px] text-[#5a189a] mt-3 font-semibold text-center">{bulkStatus}</div>
          )}
        </div>

        {showSuccess && (
          <div className="bg-[#e6fcf5] text-[#0ca678] p-4 rounded-xl mb-6 text-center font-medium text-sm border border-[#c3fae8]">
            Transaction processed !
          </div>
        )}

          <form id="paymentForm" method="POST" action="/api/checkout" onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="ccname" className="block text-gray-900 text-sm font-medium mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                id="ccname"
                name="ccname"
                autoComplete="cc-name"
                placeholder="e.g. JOHN DOE"
                required
                value={ccname}
                onChange={(e) => setCcname(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all text-gray-900"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="cardnumber" className="block text-gray-900 text-sm font-medium mb-2">
                Card Number
              </label>
              <input
                type="text"
                id="cardnumber"
                name="cardnumber"
                autoComplete="cc-number"
                placeholder="4000 1234 5678 9010"
                inputMode="numeric"
                required
                value={cardnumber}
                onChange={(e) => setCardnumber(formatCardNumber(e.target.value))}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all text-gray-900"
              />
            </div>

            <div className="flex gap-4 mb-5">
              <div className="flex-1">
                <label htmlFor="exp-month" className="block text-gray-900 text-sm font-medium mb-2">
                  Month (MM)
                </label>
                <input
                  type="text"
                  id="exp-month"
                  name="cc-exp-month"
                  autoComplete="cc-exp-month"
                  placeholder="12"
                  maxLength={2}
                  inputMode="numeric"
                  required
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all text-gray-900"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="exp-year" className="block text-gray-900 text-sm font-medium mb-2">
                  Year (YYYY)
                </label>
                <input
                  type="text"
                  id="exp-year"
                  name="cc-exp-year"
                  autoComplete="cc-exp-year"
                  placeholder="2028"
                  maxLength={4}
                  inputMode="numeric"
                  required
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all text-gray-900"
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="cvc" className="block text-gray-900 text-sm font-medium mb-2">
                Security Code (CVV)
              </label>
              <input
                type="password"
                id="cvc"
                name="cvc"
                autoComplete="cc-csc"
                placeholder="123"
                maxLength={4}
                inputMode="numeric"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full p-4 mt-3 bg-[#7b2cbf] hover:bg-[#5a189a] text-white rounded-xl text-base font-semibold transition-colors active:scale-95 disabled:opacity-70"
            >
              {isProcessing ? "Processing..." : "Save Card"}
            </button>
          </form>

        <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-[13px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          Secure payment with 256-bit encryption
        </div>
      </div>
    </div>
  );
}
