"use client";
import { Menu, LogOut } from "lucide-react";

export default function TopBar({ onToggleSidebar }) {
  return (
    <div className="flex items-center justify-between bg-white text-black px-4 py-3 shadow-md">
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
        <h1 className="hidden sm:block text-lg sm:text-xl font-semibold">
          TUPC Helmet Locker System
        </h1>
      </div>
      <button className="flex items-center gap-1 text-sm text-red-600 px-3 py-1 rounded hover:bg-red-100">
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}
