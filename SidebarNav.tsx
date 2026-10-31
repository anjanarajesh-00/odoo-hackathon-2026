import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  FileCheck2,
  FileText,
  CreditCard,
  Percent,
  Receipt,
  Users2,
  UserCheck,
  Building2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/enums";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  badge?: string;
}

const navItems: NavItem[] = [
  // Customer Portal
  {
    label: "Customer Portal",
    href: "/portal",
    icon: Building2,
    roles: ["customer"],
  },

  // Finance / Management Dashboard
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "staff"],
  },

  // Subscriptions & Quotes
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: FileCheck2,
    roles: ["admin", "staff", "customer"],
  },

  // Invoices & Billing
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
    roles: ["admin", "staff", "customer"],
  },

  // Payments
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["admin", "staff"],
  },

  // Customers Directory
  {
    label: "Customers",
    href: "/customers",
    icon: Users2,
    roles: ["admin", "staff"],
  },

  // Products & Plans
  {
    label: "Products",
    href: "/products",
    icon: Package,
    roles: ["admin", "staff"],
  },
  {
    label: "Plans",
    href: "/plans",
    icon: Layers,
    roles: ["admin", "staff"],
  },

  // Discounts & Taxes
  {
    label: "Discounts",
    href: "/discounts",
    icon: Percent,
    roles: ["admin", "staff"],
  },
  {
    label: "Taxes",
    href: "/taxes",
    icon: Receipt,
    roles: ["admin", "staff"],
  },

  // Internal Team / Staff
  {
    label: "Staff Team",
    href: "/staff",
    icon: UserCheck,
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
  if (!role) return null;

  const accessibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="space-y-1 px-2 py-4">
      {accessibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};

