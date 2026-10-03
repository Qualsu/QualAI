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
  recommendedModelName?: string;
};

export type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
};

export type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export type HtmlPreviewViewport = "desktop" | "tablet" | "mobile";

export type HtmlPreviewModalProps = {
  srcDoc: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTab: () => void;
  title?: string;
};

export type HtmlIframeProps = {
  srcDoc: string;
  className?: string;
  title?: string;
  refreshKey?: number;
};

export type LandingFeature = {
  icon: string;
  title: string;
  description: string;
};

export type LandingModelItem = {
  name: string;
  badge: string;
  description: string;
  highlights?: string[];
};

export type LandingPageProps = {
  className?: string;
};

export type LandingNavbarProps = {
  className?: string;
};

export type LandingHeaderProps = {
  className?: string;
};

export type LandingFeaturesProps = {
  className?: string;
};

export type LandingModelsProps = {
  className?: string;
};

export type LandingFooterProps = {
  className?: string;
};

