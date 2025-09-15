"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        console.log("Token stored:", data.token);
        setMessage("Login success, loading...");
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE */}
      <div className="flex flex-col items-center justify-center flex-1 p-8 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-400 text-gray-50">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-20 w-20 object-contain mb-6"
        />
        <h1 className="text-3xl font-bold mb-2">TUPC Helmet Locker System</h1>
        <p className="text-gray-200 text-sm text-center max-w-xs">
          Secure and reliable locker management system for helmets.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center p-8 bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Admin Login
          </h2>
          <p className="text-gray-500 text-sm text-center mb-4">
            Sign in to manage the system
          </p>

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200">
            Login
          </button>
        </form>
      </div>

      {message && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-sm animate-fade-in-out ${
            message.toLowerCase().includes("success")
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
