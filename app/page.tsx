"use client";

import { useState } from "react";

export default function Home() {
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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "GbaYE5uBap3Z") {
      setIsAuthenticated(true);
    } else {
      setAuthError(true);
    }
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
      setBulkStatus(
        `Loaded ${queue.length} cards. Form filled with the first card. Click Save Card to continue.`
      );

      if (queue.length > 0) {
        fillNextCard(queue);
      }
    };
    reader.readAsText(file);
  };

  const fillNextCard = (queue: any[]) => {
    if (queue.length === 0) {
      setBulkStatus("Queue is empty. All done!");
      return;
    }
    const card = queue[0];
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Mock transaction successful");
        setShowSuccess(true);

        if (navigator.credentials && (navigator.credentials as any).store) {
          try {
            const PasswordCredential = (window as any).PasswordCredential;
            if (PasswordCredential) {
              const cardCredential = new PasswordCredential({
                id: data.cardnumber,
                password: data.cvc || "123",
                name: data.ccname,
              });
              await navigator.credentials.store(cardCredential).catch(() => {});
              console.log("Actively called navigator.credentials.store() API");
            }
          } catch (err) {
            console.log("Credential API error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during processing. Please try again.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(false);

        if (cardQueue.length > 0) {
          const newQueue = [...cardQueue];
          newQueue.shift();
          setCardQueue(newQueue);
          if (newQueue.length > 0) {
            fillNextCard(newQueue);
            setBulkStatus(`Saved! ${newQueue.length} cards remaining. Form ready for next card.`);
          } else {
            setBulkStatus("All cards processed successfully!");
            setCcname("");
            setCardnumber("");
            setExpMonth("");
            setExpYear("");
            setCvc("");
          }
        }
      }, 1500);
    }
  };

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
          <p className="text-sm font-medium mb-3 text-[#5a189a]">
            Bulk Import (Format: Number|MM|YY|CVV)
          </p>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
          />
          {bulkStatus && (
            <div className="text-[13px] text-[#5a189a] mt-3 font-semibold">{bulkStatus}</div>
          )}
        </div>

        {showSuccess && (
          <div className="bg-[#e6fcf5] text-[#0ca678] p-4 rounded-xl mb-6 text-center font-medium text-sm border border-[#c3fae8]">
            Transaction processed successfully!
          </div>
        )}

        <form id="paymentForm" onSubmit={handleSubmit}>
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
