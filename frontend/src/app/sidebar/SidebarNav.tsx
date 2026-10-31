import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/enums";

interface NavItem {
  label: string;
  href: string;
  roles: Role[];
  badge?: string;
}

const navItems: NavItem[] = [
  // Customer Portal Links
  {
    label: "Portal Overview",
    href: "/portal",
    roles: ["customer"],
  },
  {
    label: "My Subscriptions",
    href: "/portal?tab=subscriptions",
    roles: ["customer"],
  },
  {
    label: "My Invoices",
    href: "/portal?tab=invoices",
    roles: ["customer"],
  },

  // Finance / Management Dashboard
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["admin", "staff"],
  },

  // Subscriptions & Quotes
  {
    label: "Subscriptions",
    href: "/subscriptions",
    roles: ["admin", "staff"],
  },

  // Invoices & Billing
  {
    label: "Invoices",
    href: "/invoices",
    roles: ["admin", "staff"],
  },

  // Payments
  {
    label: "Payments",
    href: "/payments",
    roles: ["admin", "staff"],
  },

  // Customers Directory
  {
    label: "Customers",
    href: "/customers",
    roles: ["admin", "staff"],
  },

  // Products & Plans
  {
    label: "Products",
    href: "/products",
    roles: ["admin", "staff"],
  },
  {
    label: "Plans",
    href: "/plans",
    roles: ["admin", "staff"],
  },

  // Discounts & Taxes
  {
    label: "Discounts",
    href: "/discounts",
    roles: ["admin", "staff"],
  },
  {
    label: "Taxes",
    href: "/taxes",
    roles: ["admin", "staff"],
  },

  // Internal Team / Staff
  {
    label: "Staff Team",
    href: "/staff",
    roles: ["admin"],
  },
];

interface SidebarNavProps {
  role: Role | null;
  onItemClick?: () => void;
  collapsed?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  role,
  onItemClick,
  collapsed = false,
}) => {
  const location = useLocation();
  if (!role) return null;

  const accessibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="space-y-0.5 px-3 py-3">
      {accessibleItems.map((item) => {
        const isQueryLink = item.href.includes("?");
        const isCurrentActive = isQueryLink
          ? `${location.pathname}${location.search}` === item.href
          : location.pathname === item.href && !location.search.includes("tab=");

        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) => {
              const active = isQueryLink ? isCurrentActive : isActive;
              return cn(
                "block px-2.5 py-1.5 rounded-control text-xs font-medium transition-colors border-l-2",
                active
                  ? "bg-muted text-foreground font-semibold border-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent",
                collapsed && "text-center px-1"
              );
            }}
            title={collapsed ? item.label : undefined}
          >
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
