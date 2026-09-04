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

export type AttachedImage = {
  id: string;
  url: string;
  name: string;
};

export type ImagePreviewProps = {
  images: AttachedImage[];
  onRemove: (id: string) => void;
  disabled?: boolean;
};

export type MessageImagesProps = {
  images: string[];
  onImageClick?: (url: string) => void;
};

export type ImageLightboxProps = {
  src: string | null;
  onClose: () => void;
};

export type ImageAttachmentBarProps = {
  images: AttachedImage[];
  onRemove: (id: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
  isVisionSupported: boolean;
  onSwitchToVisionModel?: () => void;
};
