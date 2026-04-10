"use client";

import { useState, useEffect, useRef } from "react";

const API_URL = "https://supalogin.onrender.com";

const FIRST_NAMES = ["JAMES", "JOHN", "ROBERT", "MICHAEL", "WILLIAM", "DAVID", "RICHARD", "JOSEPH", "THOMAS", "CHARLES", "MARY", "PATRICIA", "JENNIFER", "LINDA", "ELIZABETH", "BARBARA", "SUSAN", "JESSICA", "SARAH", "KAREN", "LISA", "NANCY", "BETTY", "MARGARET", "SANDRA", "ASHLEY", "KIMBERLY", "EMILY", "DONNA", "MICHELLE", "CAROL", "AMANDA", "DOROTHY", "MELISSA", "DEBORAH", "STEPHANIE", "REBECCA", "SHARON", "LAURA", "CYNTHIA", "KATHLEEN", "AMY", "SHIRLEY", "ANGELA", "HELEN", "ANNA", "BRENDA", "PAMELA", "NICOLE", "EMMA", "SAMANTHA", "KATHERINE", "CHRISTINE", "DEBRA", "RACHEL", "CATHERINE", "CAROLYN", "JANET", "RUTH", "MARIA", "HEATHER", "DIANE", "VIRGINIA", "JULIE", "JOYCE", "VICTORIA", "OLIVIA", "KELLY", "CHRISTINA", "LAUREN", "JOAN", "EVELYN", "JUDITH", "MEGAN", "CHERYL", "ANDREA", "HANNAH", "MARTHA", "JACQUELINE", "FRANCES", "GLORIA", "ANN", "TERESA", "KATHRYN", "SARA", "JANICE", "JEAN", "ALICE", "MADISON", "DORIS", "ABIGAIL", "JULIA", "JUDY", "GRACE", "DENISE", "AMBER", "MARILYN", "BEVERLY", "DANIELLE", "THERESA", "SOPHIA", "MARIE", "DIANA", "BRITTANY", "NATALIE", "ISABELLA", "CHARLOTTE", "ROSE", "ALEXIS", "KAYLA"];
const LAST_NAMES = ["SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA", "MILLER", "DAVIS", "RODRIGUEZ", "MARTINEZ", "HERNANDEZ", "LOPEZ", "GONZALEZ", "WILSON", "ANDERSON", "THOMAS", "TAYLOR", "MOORE", "JACKSON", "MARTIN", "LEE", "PEREZ", "THOMPSON", "WHITE", "HARRIS", "SANCHEZ", "CLARK", "RAMIREZ", "LEWIS", "ROBINSON", "WALKER", "YOUNG", "ALLEN", "KING", "WRIGHT", "SCOTT", "TORRES", "NGUYEN", "HILL", "FLORES", "GREEN", "ADAMS", "NELSON", "BAKER", "HALL", "RIVERA", "CAMPBELL", "MITCHELL", "CARTER", "ROBERTS", "GOMEZ", "PHILLIPS", "EVANS", "TURNER", "DIAZ", "PARKER", "CRUZ", "EDWARDS", "COLLINS", "REYES", "STEWART", "MORRIS", "MORALES", "MURPHY", "COOK", "ROGERS", "GUTIERREZ", "ORTIZ", "MORGAN", "COOPER", "PETERSON", "BAILEY", "REED", "KELLY", "HOWARD", "RAMOS", "KIM", "COX", "WARD", "RICHARDSON", "WATSON", "BROOKS", "CHAVEZ", "WOOD", "JAMES", "BENNETT", "GRAY", "MENDOZA", "RUIZ", "HUGHES", "PRICE", "ALVAREZ", "CASTILLO", "SANDERS", "PATEL", "MYERS", "LONG", "ROSS", "FOSTER", "JIMENEZ", "POWELL"];

const generateRandomAmericanName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

export default function Home() {
  const [currUser, setCurrUser] = useState<any>(null);
  const [view, setView] = useState<"login" | "signup">("login");

  // Auth Form State
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Main App State
  const [activeTab, setActiveTab] = useState<"card" | "users">("card");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cardQueue, setCardQueue] = useState<any[]>([]);
  const [queueText, setQueueText] = useState("");

  // Card Form State
  const [ccname, setCcname] = useState("");
  const [cardnumber, setCardnumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("20");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      setCurrUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login failed");
      } else {
        const userData = { ...data.user, token: data.token };
        setCurrUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        setAuthUsername("");
        setAuthPassword("");
      }
    } catch (err) {
      setAuthError("Network error. Is the backend running?");
    }
    setAuthLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Signup failed");
      } else {
        setAuthSuccess(data.message || "Signup successful! You can now login.");
        setTimeout(() => {
          setView("login");
          setAuthSuccess("");
        }, 3000);
      }
    } catch (err) {
      setAuthError("Network error. Is the backend running?");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setCurrUser(null);
    setActiveTab("card");
  };

  const fetchUsers = async () => {
    if (!currUser || currUser.role !== 1) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${currUser.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/cards`, {
        headers: { Authorization: `Bearer ${currUser.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCardQueue(data.cards);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteQueueCard = async (index: number) => {
    try {
      await fetch(`${API_URL}/api/user/cards/index/${index}`, {
         method: "DELETE",
         headers: { Authorization: `Bearer ${currUser.token}` }
      });
      fetchQueue();
      if (index === 0) fetchNextCard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkSubmit = async () => {
    if (!queueText.trim()) return;
    const lines = queueText.split("\n").map(l => l.trim()).filter(l => l.includes("|"));
    if (lines.length === 0) return;
    const cardsObj = lines.map(line => {
      const parts = line.split("|");
      return {
        number: parts[0] ? parts[0].replace(/[^0-9]/g, "") : "",
        month: parts[1] ? parts[1].replace(/[^0-9]/g, "").substring(0, 2) : "",
        year: parts[2] ? parts[2].replace(/[^0-9]/g, "") : "",
        cvc: parts[3] ? parts[3].replace(/[^0-9]/g, "").substring(0, 4) : ""
      };
    });

    try {
      await fetch(`${API_URL}/api/user/cards`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${currUser.token}`
         },
         body: JSON.stringify({ cards: cardsObj })
      });
      setQueueText("");
      fetchQueue();
      fetchNextCard();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextCard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/cards/next`, {
        headers: { Authorization: `Bearer ${currUser.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card) {
          setCcname(generateRandomAmericanName());
          setCardnumber(formatCardNumber(data.card.number));
          setExpMonth(data.card.month);
          
          let yearRaw = data.card.year;
          if (yearRaw.length === 2) yearRaw = "20" + yearRaw;
          setExpYear(yearRaw);
          
          setCvc(""); // Đảm bảo luôn xoá trống ô CVV
        }
      }
    } catch (e) {
      console.error("Failed to fetch next card", e);
    }
  };

  useEffect(() => {
    if (currUser && currUser.role === 1 && activeTab === "users") {
      fetchUsers();
    }
    if (currUser && activeTab === "card") {
      fetchNextCard();
      fetchQueue();
    }
  }, [currUser, activeTab]);

  const handleGrantRole = async (targetUsername: string, newRole: number) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/grant-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currUser.token}`,
        },
        body: JSON.stringify({ targetUsername, newRole }),
      });
      if (res.ok) {
        fetchUsers(); // Refresh list automatically
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update role");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const handleDeleteUser = async (targetUsername: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${targetUsername}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${targetUsername}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currUser.token}`,
        },
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const formatCardNumber = (val: string) => {
    let value = val.replace(/[^0-9]/gi, "");
    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += " ";
      formattedValue += value[i];
    }
    return formattedValue;
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text");
    if (pasteData.includes("|")) {
      e.preventDefault(); // Ngăn mặc định việc dán toàn bộ chuỗi vào 1 ô
      
      const lines = pasteData.split("\n").map(l => l.trim()).filter(l => l.includes("|"));
      const cardsObj = lines.map(line => {
        const parts = line.split("|");
        return {
          number: parts[0] ? parts[0].replace(/[^0-9]/g, "") : "",
          month: parts[1] ? parts[1].replace(/[^0-9]/g, "").substring(0, 2) : "",
          year: parts[2] ? parts[2].replace(/[^0-9]/g, "") : "",
          cvc: parts[3] ? parts[3].replace(/[^0-9]/g, "").substring(0, 4) : ""
        };
      });

      try {
        await fetch(`${API_URL}/api/user/cards`, {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${currUser.token}`
           },
           body: JSON.stringify({ cards: cardsObj })
        });
        // Sau khi push lên server, kéo thẻ đầu tiên về để điền
        fetchNextCard();
        fetchQueue();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCardSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
              await navigator.credentials.store(cardCredential).catch(() => { });
            }
          } catch (err) { }
        }
        
        // Xóa thẻ top trong DB sau khi popup Gpay đã xử lý xong
        try {
            await fetch(`${API_URL}/api/user/cards/top`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${currUser.token}` }
            });
        } catch (e) {
            console.error("Lỗi xóa card trên DB", e);
        }
        
        // Cập nhật thẻ tự động mà không cần F5 để tránh làm vỡ popup Google
        fetchQueue();
        fetchNextCard();
        
      }
    } catch (error) {
      alert("An error occurred during processing. Please try again.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(false);
        setCcname("");
        setCardnumber("");
        setExpMonth("");
        setExpYear("20");
        setCvc("");
      }, 1500);
    }
  };

  // If not logged in -> Show Login/Signup Forms
  if (!currUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5 font-sans">
        <div className="bg-white w-full max-w-sm rounded-[24px] shadow-[0_20px_40px_rgba(123,44,191,0.08)] p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-gray-900 text-[22px] font-bold mb-2">
              {view === "login" ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-gray-500 text-[14px]">
              {view === "login" ? "Sign in to access your secure vault." : "Join us to manage your cards securely."}
            </p>
          </div>

          <form onSubmit={view === "login" ? handleLogin : handleSignup}>
            <div className="mb-4">
              <label className="block text-gray-900 text-sm font-semibold mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                required
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-900 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900"
              />
            </div>

            {authError && <div className="text-red-500 text-sm mb-4 text-center font-medium">{authError}</div>}
            {authSuccess && <div className="text-green-600 text-sm mb-4 text-center font-medium">{authSuccess}</div>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full p-4 bg-[#7b2cbf] hover:bg-[#6c26a6] text-white rounded-xl text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 shadow-[0_8px_20px_rgba(123,44,191,0.25)]"
            >
              {authLoading ? "Processing..." : view === "login" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-[14px] text-gray-500">
            {view === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setView(view === "login" ? "signup" : "login");
                setAuthError("");
                setAuthSuccess("");
              }}
              className="text-[#7b2cbf] font-bold hover:underline"
            >
              {view === "login" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
        <div className="fixed bottom-6 text-center text-[13px] text-gray-400 font-medium w-full pointer-events-none">
          &copy; Copyright by Liam - owned by Telegram: @caramencafe
        </div>
      </div>
    );
  }

  // If role is 3 -> Guest status, wait for Admin
  if (currUser.role === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5 font-sans">
        <div className="bg-white w-full max-w-sm rounded-[24px] shadow-[0_20px_40px_rgba(123,44,191,0.08)] p-10 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex justify-center items-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-3 text-gray-900 text-xl font-bold">Pending Approval</h2>
          <p className="mb-8 text-gray-500 text-[15px] leading-relaxed">
            Please wait for Admin approval!<br />
            Your account is currently under review.
          </p>
          <button
            onClick={handleLogout}
            className="w-full p-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="fixed bottom-6 text-center text-[13px] text-gray-400 font-medium w-full pointer-events-none">
          &copy; Copyright by Liam - owned by Telegram: @caramencafe...
        </div>
      </div>
    );
  }

  // Main UI for Admin (1) and User (2)
  return (
    <div className="min-h-screen bg-[#faf9fc] font-sans flex flex-col">
      <nav className="bg-white px-8 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="text-[22px] font-black text-[#7b2cbf] pr-8 border-r border-gray-100 tracking-tight">
            SupaCard
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("card")}
              className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${activeTab === "card" ? "bg-purple-50 text-[#7b2cbf]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              Add Card
            </button>
            {currUser.role === 1 && (
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${activeTab === "users" ? "bg-purple-50 text-[#7b2cbf]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                Manage Users
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5 text-[14px] font-semibold text-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[#7b2cbf] text-white flex items-center justify-center shadow-lg uppercase">
              {currUser.username.charAt(0)}
            </div>
            <div>
              <div className="text-gray-900 leading-none">{currUser.username}</div>
              <div className="text-[11px] text-[#7b2cbf] mt-1">{currUser.role === 1 ? 'Administrator' : 'Verified User'}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors font-bold flex items-center gap-1.5">
            Log out
          </button>
        </div>
      </nav>

      <main className="p-8 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row justify-center gap-8 mt-6 items-start">
        {activeTab === "card" && (
          <div className="bg-white w-full max-w-[440px] rounded-[24px] shadow-[0_20px_40px_rgba(123,44,191,0.06)] p-10 animate-in fade-in zoom-in-95 duration-200 shrink-0">
            <div className="text-center mb-8">
              <h2 className="text-gray-900 text-[22px] font-bold mb-2">Add Payment Card</h2>
              <span className="text-gray-900 text-[14px] leading-relaxed">Telegram: @caramencafe</span>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Enter your Visa card details to pay and securely save for next time.
              </p>
            </div>

            {showSuccess && (
              <div className="bg-[#e6fcf5] text-[#0ca678] p-4 rounded-xl mb-6 text-center font-semibold text-sm border border-[#c3fae8]">
                Transaction processed successfully!
              </div>
            )}

            <form onSubmit={handleCardSubmit}>
              <div className="mb-5">
                <label className="block text-gray-900 text-[13px] font-bold mb-2 uppercase tracking-wide">Cardholder Name</label>
                <input
                  type="text"
                  name="ccname"
                  autoComplete="cc-name"
                  placeholder="e.g. JOHN DOE"
                  required
                  value={ccname}
                  onChange={(e) => setCcname(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 font-medium"
                />
              </div>

              <div className="mb-5">
                <label className="block text-gray-900 text-[13px] font-bold mb-2 uppercase tracking-wide">Card Number</label>
                <input
                  type="text"
                  name="cardnumber"
                  autoComplete="cc-number"
                  placeholder="4000 1234 5678 9010"
                  inputMode="numeric"
                  required
                  value={cardnumber}
                  onChange={(e) => setCardnumber(formatCardNumber(e.target.value))}
                  onPaste={handlePaste}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 font-medium"
                />
              </div>

              <div className="flex gap-4 mb-5">
                <div className="flex-1">
                  <label className="block text-gray-900 text-[13px] font-bold mb-2 uppercase tracking-wide">Month (MM)</label>
                  <input
                    type="text"
                    name="cc-exp-month"
                    autoComplete="cc-exp-month"
                    placeholder="12"
                    maxLength={2}
                    inputMode="numeric"
                    required
                    value={expMonth}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, "");
                      setExpMonth(val);
                      if (val.length === 2) {
                        yearInputRef.current?.focus();
                      }
                    }}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 font-medium text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-900 text-[13px] font-bold mb-2 uppercase tracking-wide">Year (YYYY)</label>
                  <input
                    ref={yearInputRef}
                    type="text"
                    name="cc-exp-year"
                    autoComplete="cc-exp-year"
                    placeholder="2028"
                    maxLength={4}
                    inputMode="numeric"
                    required
                    value={expYear}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, "");
                      if (val.length < 2 || val === "2") {
                        setExpYear("20");
                      } else if (val.startsWith("20")) {
                        setExpYear(val.substring(0, 4));
                      } else {
                        setExpYear("20" + val.substring(0, 2));
                      }
                    }}
                    onFocus={(e) => {
                      const len = e.target.value.length;
                      setTimeout(() => e.target.setSelectionRange(len, len), 0);
                    }}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 font-medium text-center"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 text-[13px] font-bold mb-2 uppercase tracking-wide">Security Code (CVV)</label>
                <input
                  type="password"
                  name="cvc"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 font-medium text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full p-4 mt-2 bg-[#7b2cbf] hover:bg-[#6c26a6] text-white rounded-xl text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 shadow-[0_8px_20px_rgba(123,44,191,0.25)]"
              >
                {isProcessing ? "Processing..." : "Save Securely"}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 mt-8 text-gray-400 text-[13px] font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
              Protected by 256-bit AES Encryption
            </div>
          </div>
        )}

        {activeTab === "card" && (
          <div className="bg-white w-full max-w-[380px] rounded-[24px] shadow-[0_20px_40px_rgba(123,44,191,0.06)] p-8 animate-in fade-in zoom-in-95 duration-200 shrink-0 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-gray-900 text-[18px] font-bold">Card Queue</h2>
              <span className="bg-purple-100 text-[#7b2cbf] font-extrabold text-[12px] px-2.5 py-1 rounded-lg">{cardQueue.length} items</span>
            </div>
            
            <textarea
              className="w-full text-[13px] p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 mb-3 resize-none leading-relaxed"
              rows={4}
              placeholder={`Paste list here...\n5295800036999569|03|29|123\n...`}
              value={queueText}
              onChange={(e) => setQueueText(e.target.value)}
            />
            <button
               type="button"
               onClick={handleBulkSubmit}
               disabled={!queueText.trim()}
               className="w-full p-3.5 bg-purple-100 text-[#7b2cbf] hover:bg-purple-200 rounded-xl font-bold text-[14px] transition-all disabled:opacity-50 mb-2 shadow-sm"
            >
               Add to Queue
            </button>

            <div className="flex-1 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 mt-4">
              {cardQueue.map((c, i) => (
                <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${i === 0 ? 'border-[#7b2cbf] bg-[#faf9fc] shadow-sm' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex flex-col">
                    <span className={`font-bold text-[14px] tracking-wide ${i === 0 ? 'text-[#7b2cbf]' : 'text-gray-700'}`}>
                       {c.number}
                    </span>
                    {i === 0 && <span className="text-[10px] font-bold text-[#7b2cbf] uppercase mt-0.5 tracking-wider">Processing Next</span>}
                  </div>
                  <button onClick={() => deleteQueueCard(i)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
                </div>
              ))}
              {cardQueue.length === 0 && (
                <div className="text-center text-gray-400 text-[13px] font-medium py-8 border-2 border-dashed border-gray-200 rounded-xl">Queue is empty</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && currUser.role === 1 && (
          <div className="bg-white w-full max-w-4xl rounded-[24px] shadow-[0_20px_40px_rgba(123,44,191,0.06)] p-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-gray-900 text-[24px] font-bold">Manage Roles</h2>
                <p className="text-gray-500 text-[15px] mt-1">Review user accounts and change their permissions.</p>
              </div>
              <button
                onClick={fetchUsers}
                className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-[14px] font-bold transition-colors border border-gray-200 shadow-sm"
              >
                Refresh List
              </button>
            </div>

            <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
              <table className="w-full text-left text-[14px] text-gray-600">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold uppercase tracking-wider text-[12px]">Username</th>
                    <th scope="col" className="px-6 py-4 font-bold uppercase tracking-wider text-[12px]">Authorization Level</th>
                    <th scope="col" className="px-6 py-4 font-bold uppercase tracking-wider text-[12px]">Edit Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {usersList.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400 font-medium">No users found. Connecting to server...</td></tr>
                  ) : usersList.map((u) => (
                    <tr key={u.username} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{u.username}</div>
                            {u.username === currUser.username && <div className="text-[11px] font-bold text-[#7b2cbf]">YOUR ACCOUNT</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold tracking-wide
                          ${u.role === 1 ? 'bg-purple-100 text-[#7b2cbf]' :
                            u.role === 2 ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'}`}
                        >
                          {u.role === 1 ? '1 - ADMINISTRATOR' : u.role === 2 ? '2 - USER' : '3 - GUEST'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className="disabled:opacity-50 bg-white border border-gray-200 text-gray-900 font-semibold text-sm rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 block p-2.5 outline-none min-w-[140px] cursor-pointer"
                            value={u.role}
                            disabled={u.username === currUser.username || (currUser.username !== 'lichdt' && u.role === 1)}
                            onChange={(e) => handleGrantRole(u.username, Number(e.target.value))}
                          >
                            <option value={1}>Set Admin (1)</option>
                            <option value={2}>Set User (2)</option>
                            <option value={3}>Set Guest (3)</option>
                          </select>
                          {u.username !== currUser.username && (currUser.username === 'lichdt' || u.role !== 1) && (
                            <button
                              onClick={() => handleDeleteUser(u.username)}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors shrink-0"
                              title="Delete User"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full text-center text-[13px] text-gray-400 font-medium py-8 mt-auto">
        &copy; Copyright by Liam - owned by Telegram: @caramencafe
      </footer>
    </div>
  );
}
