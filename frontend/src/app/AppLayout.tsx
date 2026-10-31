import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { SidebarNav } from "./sidebar/SidebarNav";
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AppLayout: React.FC = () => {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith("/dashboard")) return "Finance & Revenue Dashboard";
    if (pathname.startsWith("/subscriptions")) return "Subscription Management";
    if (pathname.startsWith("/invoices")) return "Invoices & Billing";
    if (pathname.startsWith("/payments")) return "Payment Transactions";
    if (pathname.startsWith("/customers")) return "Customers Directory";
    if (pathname.startsWith("/products")) return "Product Catalog";
    if (pathname.startsWith("/plans")) return "Subscription Plans";
    if (pathname.startsWith("/discounts")) return "Discount Rules";
    if (pathname.startsWith("/taxes")) return "Tax Configuration";
    if (pathname.startsWith("/staff")) return "Staff Members";
    if (pathname.startsWith("/portal")) return "Customer Portal";
    return "Brightloop Software";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-control bg-primary flex items-center justify-center text-primary-foreground font-mono text-[11px] font-bold">
              BL
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
                Brightloop
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-control text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={role} onItemClick={() => setMobileOpen(false)} />
        </div>

        {/* Sidebar Footer with Role tag */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || "User"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs uppercase font-semibold text-muted-foreground">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {getPageTitle(location.pathname)}
            </h2>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-xs border border-border">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline-block max-w-[120px] truncate">
                {user?.name || user?.email}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1.5 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-semibold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-primary/10 text-primary">
                      Role: {role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

