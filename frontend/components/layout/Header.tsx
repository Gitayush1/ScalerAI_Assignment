"use client";

import { Search, Bell, HelpCircle, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center gap-4">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title (mobile) */}
      {title && (
        <span className="font-semibold text-gray-800 md:hidden">{title}</span>
      )}

      {/* Search — hidden on small screens */}
      <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-sm">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search meetings..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={19} />
        </button>
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>
        {/* Avatar */}
        <div className="ml-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
