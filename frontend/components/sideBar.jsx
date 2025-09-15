"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Wallet,
  CreditCard,
  Settings,
  PlusSquare,
  ClipboardList,
  ArrowLeftFromLine,
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-18 left-4 z-50 bg-transparent p-2"
        onClick={() => setOpen(!open)}
      >
        <ArrowLeftFromLine
          size={28}
          className={open ? "text-gray-50" : "text-blue-950"}
        />
      </button>
      <div
        className={`
          fixed top-16 left-0 h-full w-64 bg-blue-950 shadow-md z-40 p-4 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:block
        `}
      >
        <ul className="pt-20 space-y-7">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            href="/dashboard"
          />
          <SidebarItem
            icon={<UserPlus size={18} />}
            label="Register"
            href="/register"
          />
          <SidebarItem
            icon={<Wallet size={18} />}
            label="Users Credit"
            href="/users-credit"
          />
          <SidebarItem
            icon={<CreditCard size={18} />}
            label="Set Payment"
            href="/set-payment"
          />
          <SidebarItem
            icon={<PlusSquare size={18} />}
            label="Add Slots"
            href="/add-slots"
          />
          <SidebarItem
            icon={<Settings size={18} />}
            label="Control Lockers"
            href="/control-locker"
          />
          <SidebarItem
            icon={<ClipboardList size={18} />}
            label="Locker Logs"
            href="/locker-logs"
          />
        </ul>
      </div>
    </>
  );
}

function SidebarItem({ icon, label, href }) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-3 text-gray-50 hover:text-red-400 transition-colors"
      >
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}
