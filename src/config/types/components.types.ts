import React from "react";

export type AppShellProps = {
  children: React.ReactNode;
};

export type ModelSelectorProps = {
  className?: string;
};

export type NavbarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
};

export type SessionItem = {
  sessionId: string;
  preview: string;
  startedAt: string;
};

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export type UserMenuProps = {
  isCollapsed?: boolean;
};
