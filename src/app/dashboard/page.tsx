"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  company: string;
  avatar: string;
  isSelected?: boolean;
}

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [customersNestOpen, setCustomersNestOpen] = useState(false);
  const [sortOption, setSortOption] = useState<"Newest" | "Oldest" | "Value">("Newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("c2");
  const [isStarred, setIsStarred] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Yearly");
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);

  const customers: Customer[] = [
    {
      id: "c1",
      name: "Chris Friedkly",
      company: "Supermarket Villanova",
      avatar: "/figma/customer_chris.png",
    },
    {
      id: "c2",
      name: "Maggie Johnson",
      company: "Oasis Organic Inc.",
      avatar: "/figma/customer_maggie.png",
      isSelected: true,
    },
    {
      id: "c3",
      name: "Gael Harry",
      company: "New York Finest Fruits",
      avatar: "/figma/customer_gael.png",
    },
    {
      id: "c4",
      name: "Jenna Sullivan",
      company: "Walmart",
      avatar: "/figma/customer_jenna.png",
    },
  ];

  const deals = [
    "Fruit2Go",
    "Marshall's MKT",
    "CCNT",
    "Joana Mini-market",
    "Little Brazil Vegan",
    "Target",
    "Organic Place",
    "Morello's",
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F3] p-2 sm:p-4 font-sans text-[#131313] flex justify-center items-start">
      {/* Outer Dashboard Frame matching 1440px Figma Artboard */}
      <div className="w-full max-w-[1440px] bg-[#F6F6F3] rounded-[32px] p-2 sm:p-4 flex flex-col lg:flex-row gap-4 items-stretch shadow-sm">
        
        {/* ========================================================= */}
        {/* SIDEBAR COMPONENT (#1:371)                                */}
        {/* ========================================================= */}
        <aside
          className={`bg-white rounded-[16px] transition-all duration-300 flex flex-col justify-between shrink-0 shadow-sm ${
            isCollapsed ? "w-full lg:w-[80px]" : "w-full lg:w-[280px]"
          }`}
        >
          {/* Top Brand & Nav Section */}
          <div className="flex flex-col">
            {/* Brand Logo Header */}
            <div className="p-4 sm:p-6 pb-3 flex items-center justify-between relative">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                  <Image
                    src="/figma/logo_mark.svg"
                    alt="Logo mark"
                    width={21}
                    height={21}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <Image
                    src="/figma/logo_text.svg"
                    alt="Logo text"
                    width={121}
                    height={24}
                    className="h-5 w-auto object-contain transition-opacity duration-200"
                  />
                )}
              </div>

              {/* Collapse Toggle Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-6 h-6 rounded-[8px] bg-[#F6F6F3] hover:bg-[#eaeae5] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle sidebar collapse"
              >
                <Image
                  src="/figma/icons/icon_chevron_down.svg"
                  alt="Collapse toggle"
                  width={12}
                  height={12}
                  className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="px-3 pb-3">
              <div className="bg-white border border-[#F1F1F1] rounded-[20px] px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#FFA500]/50 transition-colors">
                <Image
                  src="/figma/icons/icon_search.svg"
                  alt="Search"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0 opacity-60"
                />
                {!isCollapsed && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="bg-transparent border-none outline-none text-sm text-[#131313] placeholder-[#7D7D7D] w-full"
                  />
                )}
              </div>
            </div>

            {/* Nav Menu Items */}
            <nav className="p-2 space-y-1">
              {/* 1. Dashboard (Active) */}
              <button
                onClick={() => setActiveNav("Dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === "Dashboard"
                    ? "bg-[#FFF7E8] text-[#131313]"
                    : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Image
                  src="/figma/icons/icon_layout_collage.svg"
                  alt="Dashboard"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span className="truncate">Dashboard</span>}
              </button>

              {/* 2. Customers (Expandable Nest) */}
              <div>
                <button
                  onClick={() => {
                    setActiveNav("Customers");
                    setCustomersNestOpen(!customersNestOpen);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                    activeNav === "Customers"
                      ? "bg-[#FFF7E8] text-[#131313]"
                      : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/figma/icons/icon_users.svg"
                      alt="Customers"
                      width={16}
                      height={16}
                      className="w-4 h-4 shrink-0"
                    />
                    {!isCollapsed && <span className="truncate">Customers</span>}
                  </div>
                  {!isCollapsed && (
                    <Image
                      src="/figma/icons/icon_chevron_down.svg"
                      alt="Chevron"
                      width={16}
                      height={16}
                      className={`w-4 h-4 opacity-50 transition-transform duration-200 ${
                        customersNestOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenu Nest when opened */}
                {customersNestOpen && !isCollapsed && (
                  <div className="pl-9 pr-3 py-1 space-y-1 text-xs text-[#50c8a840]">
                    <div className="py-1 px-2 hover:text-[#131313] cursor-pointer rounded">Active Accounts</div>
                    <div className="py-1 px-2 hover:text-[#131313] cursor-pointer rounded">Leads & Prospects</div>
                  </div>
                )}
              </div>

              {/* 3. All reports */}
              <button
                onClick={() => setActiveNav("All reports")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === "All reports"
                    ? "bg-[#FFF7E8] text-[#131313]"
                    : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Image
                  src="/figma/icons/icon_clipboard_data.svg"
                  alt="All reports"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span className="truncate">All reports</span>}
              </button>

              {/* 4. Geography */}
              <button
                onClick={() => setActiveNav("Geography")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === "Geography"
                    ? "bg-[#FFF7E8] text-[#131313]"
                    : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Image
                  src="/figma/icons/icon_world.svg"
                  alt="Geography"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span className="truncate">Geography</span>}
              </button>

              {/* 5. Conversations */}
              <button
                onClick={() => setActiveNav("Conversations")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === "Conversations"
                    ? "bg-[#FFF7E8] text-[#131313]"
                    : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Image
                  src="/figma/icons/icon_message_circle.svg"
                  alt="Conversations"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span className="truncate">Conversations</span>}
              </button>

              {/* 6. Deals */}
              <button
                onClick={() => setActiveNav("Deals")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === "Deals"
                    ? "bg-[#FFF7E8] text-[#131313]"
                    : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Image
                  src="/figma/icons/icon_basket_check.svg"
                  alt="Deals"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span className="truncate">Deals</span>}
              </button>

              {/* 7. Export */}
              <button
                onClick={() => setActiveNav("Export")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[24px] text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === "Export"
                    ? "bg-[#FFF7E8] text-[#131313]"
                    : "text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Image
                  src="/figma/icons/icon_database_export.svg"
                  alt="Export"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span className="truncate">Export</span>}
              </button>
            </nav>
          </div>

          {/* User Profile & Account Footer */}
          <div className="p-3 pt-6 border-t border-[#F6F6F3] space-y-3">
            {/* User Info Bar */}
            <div className={`flex items-center gap-3 px-2 ${isCollapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#F1F1F1]">
                <Image
                  src="/figma/avatar_gustavo.png"
                  alt="Gustavo Xavier"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#131313] leading-none mb-1">Gustavo Xavier</span>
                  <div>
                    <span className="inline-block bg-[#FFCD71] text-[#131313] text-[10px] font-normal px-2 py-0.5 rounded-full leading-tight">
                      Admin
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Settings & Logout */}
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveNav("Settings")}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-[24px] text-sm text-[#7D7D7D] hover:bg-[#F6F6F3] hover:text-[#131313] transition-colors cursor-pointer ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <Image
                  src="/figma/icons/icon_settings.svg"
                  alt="Settings"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span>Settings</span>}
              </button>

              <button
                onClick={() => alert("Logged out successfully.")}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-[24px] text-sm text-[#B01212] hover:bg-red-50 transition-colors cursor-pointer ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <Image
                  src="/figma/icons/icon_logout.svg"
                  alt="Log out"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0"
                />
                {!isCollapsed && <span>Log out</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* DASHBOARD BODY (#33:238)                                  */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* ------------------------------------------------------- */}
          {/* ROW 1: Key Metrics (Revenues, Lost deals, Quarter goal) */}
          {/* ------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Widget 1: Revenues (#28:2907) */}
            <div className="bg-white rounded-[16px] p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
              <div>
                <h3 className="text-xl font-semibold text-[#131313] mb-4">Revenues</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[48px] font-medium tracking-tight text-[#131313] leading-none">15%</span>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Image
                      src="/figma/icons/icon_arrow_up_right.svg"
                      alt="Increase"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
                <p className="text-sm text-[#454545]">Increase compared to last week</p>
              </div>

              <div className="pt-4 flex items-center">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#734A00] hover:underline"
                >
                  <span>Revenues report</span>
                  <Image
                    src="/figma/icons/icon_arrow_narrow_right.svg"
                    alt="Arrow"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </Link>
              </div>
            </div>

            {/* Widget 2: Lost deals (#33:217) */}
            <div className="bg-white rounded-[16px] p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
              <div>
                <h3 className="text-xl font-semibold text-[#131313] mb-4">Lost deals</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[48px] font-medium tracking-tight text-[#131313] leading-none">4%</span>
                </div>
                <p className="text-sm text-[#454545]">You closed 96 out of 100 deals</p>
              </div>

              <div className="pt-4 flex items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#734A00] hover:underline"
                >
                  <span>All deals</span>
                  <Image
                    src="/figma/icons/icon_arrow_narrow_right.svg"
                    alt="Arrow"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </Link>
              </div>
            </div>

            {/* Widget 3: Quarter goal (#33:178) */}
            <div className="bg-white rounded-[16px] p-6 flex flex-col items-center justify-between shadow-sm min-h-[220px]">
              <h3 className="text-xl font-semibold text-[#131313] text-center w-full mb-3">Quarter goal</h3>

              {/* Semicircular Radial Gauge */}
              <div className="relative w-[210px] h-[102px] flex items-end justify-center">
                {/* Background arc */}
                <Image
                  src="/figma/quarter_goal_bg.svg"
                  alt="Goal Background"
                  width={209}
                  height={102}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                {/* Left endpoint accent */}
                <Image
                  src="/figma/quarter_goal_accent.svg"
                  alt="Accent"
                  width={41}
                  height={70}
                  className="absolute left-0 bottom-0 pointer-events-none"
                />
                {/* Golden progress arc */}
                <Image
                  src="/figma/quarter_goal_progress.svg"
                  alt="Goal Progress"
                  width={186}
                  height={102}
                  className="absolute left-0 bottom-0 pointer-events-none"
                />
                {/* Center Percentage Display */}
                <span className="relative z-10 text-[32px] font-medium text-[#131313] tracking-tight leading-none mb-1">
                  84%
                </span>
              </div>

              <div className="pt-3 flex items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#734A00] hover:underline"
                >
                  <span>All goals</span>
                  <Image
                    src="/figma/icons/icon_arrow_narrow_right.svg"
                    alt="Arrow"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </Link>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------- */}
          {/* ROW 2: Customers List & Growth Chart with Top Stats     */}
          {/* ------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Customers Table/List Widget (#33:240) - 7 cols on LG */}
            <div className="lg:col-span-7 bg-white rounded-[16px] py-6 flex flex-col justify-between shadow-sm min-h-[400px]">
              <div>
                {/* Customers Header */}
                <div className="px-6 flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#131313]">Customers</h3>
                  
                  {/* Sort by dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="flex items-center gap-1.5 text-sm text-[#454545] cursor-pointer"
                    >
                      <span>Sort by</span>
                      <strong className="font-medium text-[#131313]">{sortOption}</strong>
                      <Image
                        src="/figma/icons/icon_chevron_down.svg"
                        alt="Sort"
                        width={14}
                        height={14}
                        className={`w-3.5 h-3.5 opacity-60 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isSortOpen && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-[#F1F1F1] py-1 z-20 text-xs">
                        {(["Newest", "Oldest", "Value"] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortOption(opt);
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-[#FFF7E8] ${
                              sortOption === opt ? "font-bold text-[#734A00]" : "text-[#454545]"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customers List Items */}
                <div className="px-2 space-y-1">
                  {customers.map((c) => {
                    const isSelected = selectedCustomerId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`rounded-[16px] px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? "bg-[#FFF7E8]" : "hover:bg-[#F6F6F3]"
                        }`}
                      >
                        {/* Avatar & Name Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-black/5">
                            <Image
                              src={c.avatar}
                              alt={c.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#131313] leading-snug">{c.name}</span>
                            <span className="text-xs text-[#454545] leading-none">{c.company}</span>
                          </div>
                        </div>

                        {/* Selected Customer Inline Action Tools */}
                        {isSelected && (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {/* Message Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Opening direct conversation with ${c.name}`);
                                }}
                                className="w-9 h-9 rounded-full hover:bg-white/80 transition-colors flex items-center justify-center cursor-pointer"
                                title="Message"
                              >
                                <Image
                                  src="/figma/icons/icon_message_circle.svg"
                                  alt="Message"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 opacity-75"
                                />
                              </button>

                              {/* Star Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsStarred(!isStarred);
                                }}
                                className="w-9 h-9 rounded-full hover:bg-white/80 transition-colors flex items-center justify-center cursor-pointer"
                                title={isStarred ? "Starred" : "Star"}
                              >
                                <Image
                                  src="/figma/icons/icon_star.svg"
                                  alt="Star"
                                  width={16}
                                  height={16}
                                  className={`w-4 h-4 transition-transform ${isStarred ? "scale-110 filter brightness-50" : "opacity-75"}`}
                                />
                              </button>

                              {/* Pencil Edit Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Edit profile for ${c.name}`);
                                }}
                                className="w-9 h-9 rounded-full hover:bg-white/80 transition-colors flex items-center justify-center cursor-pointer"
                                title="Edit"
                              >
                                <Image
                                  src="/figma/icons/icon_pencil.svg"
                                  alt="Edit"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 opacity-75"
                                />
                              </button>
                            </div>

                            {/* Vertical divider line */}
                            <div className="w-[1px] h-6 bg-[#734A00]/20 shrink-0" />

                            {/* More Options Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Options for ${c.name}`);
                              }}
                              className="w-9 h-9 rounded-full hover:bg-white/80 transition-colors flex items-center justify-center cursor-pointer"
                              title="More options"
                            >
                              <Image
                                src="/figma/icons/icon_dots_vertical.svg"
                                alt="More options"
                                width={16}
                                height={16}
                                className="w-4 h-4 opacity-75"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom "All customers" link */}
              <div className="px-6 pt-3 flex items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#734A00] hover:underline"
                >
                  <span>All customers</span>
                  <Image
                    src="/figma/icons/icon_arrow_narrow_right.svg"
                    alt="Arrow"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </Link>
              </div>
            </div>

            {/* Growth & Top Statistics Column (#33:405) - 5 cols on LG */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Growth Chart Widget (#33:406) */}
              <div className="bg-white rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#131313]">Growth</h3>
                  
                  {/* Timeframe Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                      className="flex items-center gap-1.5 text-sm text-[#454545] cursor-pointer"
                    >
                      <span>{timeFilter}</span>
                      <Image
                        src="/figma/icons/icon_chevron_down.svg"
                        alt="Time filter"
                        width={14}
                        height={14}
                        className={`w-3.5 h-3.5 opacity-60 transition-transform ${isTimeFilterOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isTimeFilterOpen && (
                      <div className="absolute right-0 mt-2 w-28 bg-white rounded-xl shadow-lg border border-[#F1F1F1] py-1 z-20 text-xs">
                        {["Yearly", "Monthly", "Weekly"].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setTimeFilter(item);
                              setIsTimeFilterOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#FFF7E8]"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Growth Chart with Axis Lines */}
                <div className="relative w-full h-[150px] flex flex-col justify-between pt-2">
                  {/* Y-axis grid lines and labels */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {["100k", "50k", "20k", "10k", "0"].map((val, idx) => (
                      <div key={idx} className="flex items-center w-full">
                        <span className="text-[10px] font-medium text-[#7D7D7D] w-8 shrink-0">{val}</span>
                        <div className="flex-1 h-[1px] bg-[#F1F1F1]" />
                      </div>
                    ))}
                  </div>

                  {/* Growth Curve Mask Vector from Figma */}
                  <div className="relative pl-8 pr-2 w-full h-[122px] flex items-center justify-center">
                    <Image
                      src="/figma/growth_chart.svg"
                      alt="Growth Chart Curve"
                      width={405}
                      height={122}
                      className="w-full h-full object-fill pointer-events-none"
                    />
                  </div>

                  {/* X-axis Year labels */}
                  <div className="pl-8 flex justify-between text-[10px] font-medium text-[#7D7D7D] pt-1">
                    {["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"].map((yr) => (
                      <span key={yr}>{yr}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Summary Mini-Widgets Row (#34:506) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                
                {/* Mini Card 1: Top month */}
                <div className="bg-white rounded-[16px] p-3 sm:p-4 flex flex-col justify-between shadow-sm min-h-[96px]">
                  <span className="text-sm sm:text-base font-semibold text-[#7D7D7D] leading-tight">Top month</span>
                  <div>
                    <h4 className="text-lg sm:text-2xl font-semibold text-[#734A00] leading-none mb-0.5">November</h4>
                    <span className="text-xs sm:text-sm font-medium text-[#FFA500]">2019</span>
                  </div>
                </div>

                {/* Mini Card 2: Top year */}
                <div className="bg-white rounded-[16px] p-3 sm:p-4 flex flex-col justify-between shadow-sm min-h-[96px]">
                  <span className="text-sm sm:text-base font-semibold text-[#7D7D7D] leading-tight">Top year</span>
                  <div>
                    <h4 className="text-lg sm:text-2xl font-semibold text-[#734A00] leading-none mb-0.5">2023</h4>
                    <span className="text-[10px] sm:text-xs text-[#50c8a840]">96K sold so far</span>
                  </div>
                </div>

                {/* Mini Card 3: Top buyer */}
                <div className="bg-white rounded-[16px] p-3 sm:p-4 flex flex-col justify-between shadow-sm min-h-[96px]">
                  <span className="text-sm sm:text-base font-semibold text-[#7D7D7D] leading-tight">Top buyer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/5">
                      <Image
                        src="/figma/customer_maggie.png"
                        alt="Maggie Johnson"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-medium text-[#131313] truncate leading-tight">Maggie Johnson</span>
                      <span className="text-[10px] text-[#50c8a840] truncate leading-none">Oasis Organic Inc.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ------------------------------------------------------- */}
          {/* ROW 3: Chats, Top states, New deals                     */}
          {/* ------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Widget 5: Chats (#34:569) */}
            <div className="bg-white rounded-[16px] p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
              <div>
                <h3 className="text-xl font-semibold text-[#131313] mb-1">Chats</h3>
                <p className="text-sm text-[#454545] mb-4">2 unread messages</p>

                {/* Avatars Row with notification pills */}
                <div className="flex items-center gap-3">
                  {/* Chat Avatar 1 (Unread) */}
                  <div className="relative p-2.5 bg-[#FFF7E8] rounded-[16px]">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/figma/customer_maggie.png"
                        alt="Chat 1"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Red Notification Indicator */}
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EB5050] ring-2 ring-[#FFF7E8]" />
                  </div>

                  {/* Chat Avatar 2 (Unread) */}
                  <div className="relative p-2.5 bg-[#FFF7E8] rounded-[16px]">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/figma/chat_avatar_2.png"
                        alt="Chat 2"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EB5050] ring-2 ring-[#FFF7E8]" />
                  </div>

                  {/* Chat Avatar 3 */}
                  <div className="p-2.5 rounded-[16px] hover:bg-[#F6F6F3] transition-colors">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/figma/chat_avatar_3.png"
                        alt="Chat 3"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Chat Avatar 4 */}
                  <div className="p-2.5 rounded-[16px] hover:bg-[#F6F6F3] transition-colors">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/figma/chat_avatar_4.png"
                        alt="Chat 4"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#734A00] hover:underline"
                >
                  <span>All messages</span>
                  <Image
                    src="/figma/icons/icon_arrow_narrow_right.svg"
                    alt="Arrow"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </Link>
              </div>
            </div>

            {/* Widget 6: Top states (#34:694) */}
            <div className="bg-white rounded-[16px] p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
              <div>
                <h3 className="text-xl font-semibold text-[#131313] mb-4">Top states</h3>

                {/* State Progress Bars with linear gradients */}
                <div className="space-y-2.5">
                  {/* NY - 120k */}
                  <div
                    className="h-8 rounded-[4px] px-2.5 flex items-center justify-between"
                    style={{
                      background: "linear-gradient(90deg, #FFCD71 0%, rgba(255, 205, 113, 0) 100%)",
                      width: "100%",
                    }}
                  >
                    <span className="text-sm font-semibold uppercase text-[#131313]">NY</span>
                    <span className="text-[10px] font-medium uppercase text-[#131313]">120k</span>
                  </div>

                  {/* MA - 80k */}
                  <div
                    className="h-8 rounded-[4px] px-2.5 flex items-center justify-between"
                    style={{
                      background: "linear-gradient(90deg, #FFCD71 0%, rgba(255, 205, 113, 0) 100%)",
                      width: "80%",
                    }}
                  >
                    <span className="text-sm font-semibold uppercase text-[#131313]">MA</span>
                    <span className="text-[10px] font-medium uppercase text-[#131313]">80k</span>
                  </div>

                  {/* NH - 70k */}
                  <div
                    className="h-8 rounded-[4px] px-2.5 flex items-center justify-between"
                    style={{
                      background: "linear-gradient(90deg, #FFCD71 0%, rgba(255, 205, 113, 0) 100%)",
                      width: "70%",
                    }}
                  >
                    <span className="text-sm font-semibold uppercase text-[#131313]">NH</span>
                    <span className="text-[10px] font-medium uppercase text-[#131313]">70k</span>
                  </div>

                  {/* OR - 50k */}
                  <div
                    className="h-8 rounded-[4px] px-2.5 flex items-center justify-between"
                    style={{
                      background: "linear-gradient(90deg, #FFCD71 0%, rgba(255, 205, 113, 0) 100%)",
                      width: "50%",
                    }}
                  >
                    <span className="text-sm font-semibold uppercase text-[#131313]">OR</span>
                    <span className="text-[10px] font-medium uppercase text-[#131313]">50k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 7: New deals (#34:740) */}
            <div className="bg-white rounded-[16px] p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
              <div>
                <h3 className="text-xl font-semibold text-[#131313] mb-3">New deals</h3>

                {/* Deal tags cloud */}
                <div className="flex flex-wrap gap-2">
                  {deals.map((deal, idx) => (
                    <button
                      key={idx}
                      onClick={() => alert(`View deal: ${deal}`)}
                      className="bg-[#FFF7E8] hover:bg-[#ffeecb] text-[#734A00] rounded-[16px] px-3.5 py-2 flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
                    >
                      <Image
                        src="/figma/icons/icon_square_rounded_plus.svg"
                        alt="Add deal"
                        width={16}
                        height={16}
                        className="w-4 h-4 shrink-0"
                      />
                      <span>{deal}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
