"use client";

import { clearChatSession, fetchAllHistory } from "@/app/api/chat";
import type { ChatMessage } from "@/config/types";
import { useUser } from "@clerk/nextjs";
import { ChevronFirstIcon, ChevronLastIcon, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import UserMenu from "@/components/layout/user-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME, images, pages } from "@/config";
import type { NavbarProps, SessionItem } from "@/config/types";

const CHAT_SESSIONS_UPDATED_EVENT = "chat-sessions-updated";
const NEW_CHAT_EVENT = "new-chat";

function buildSessionPreview(
    sessionId: string,
    history: ChatMessage[],
    startedAt: string,
): SessionItem {
    const firstUserMessage = history.find((message) => message.role === "user");
    const fallback = `Чат ${sessionId.slice(0, 8)}`;
    let preview = fallback;
    if (firstUserMessage?.content?.trim()) {
        preview = firstUserMessage.content.trim();
    } else if (firstUserMessage?.images && firstUserMessage.images.length > 0) {
        preview = "📷 Изображение";
    }

    return {
        sessionId,
        preview,
        startedAt,
    };
}

export default function Navbar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: NavbarProps) {
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [currentPath, setCurrentPath] = useState(pathname);

    const accountId = user?.id ?? "guest";
    const showFull = !isCollapsed || isMobileOpen;

    const handleNewChat = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(NEW_CHAT_EVENT));
        }
        router.push(pages.ROOT);
        onMobileClose();
    };

    useEffect(() => {
        setCurrentPath(pathname);
    }, [pathname]);

    useEffect(() => {
        const handleLocationSync = () => {
            if (typeof window !== "undefined") {
                setCurrentPath(window.location.pathname);
            }
        };

        window.addEventListener("popstate", handleLocationSync);
        window.addEventListener(CHAT_SESSIONS_UPDATED_EVENT, handleLocationSync);

        return () => {
            window.removeEventListener("popstate", handleLocationSync);
            window.removeEventListener(CHAT_SESSIONS_UPDATED_EVENT, handleLocationSync);
        };
    }, []);

    const activeSessionId = useMemo(() => {
        if (!currentPath || currentPath === pages.ROOT) {
            return null;
        }

        return currentPath.slice(1);
    }, [currentPath]);

    useEffect(() => {
        let isMounted = true;

        const loadAllSessions = async (showLoader = true) => {
            if (showLoader) setIsLoading(true);
            try {
                const data = await fetchAllHistory({ account_id: accountId });
                const sessionItems = Object.entries(data.sessions)
                    .map(([sessionId, history]) => buildSessionPreview(
                        sessionId,
                        history,
                        data.session_started_at[sessionId] ?? "",
                    ));

                if (isMounted) {
                    setSessions(sessionItems);
                }
            } catch {
                if (isMounted) {
                    setSessions([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        const handleSessionUpdate = () => {
            void loadAllSessions(false);
        };

        void loadAllSessions(true);
        window.addEventListener(CHAT_SESSIONS_UPDATED_EVENT, handleSessionUpdate);

        return () => {
            isMounted = false;
            window.removeEventListener(CHAT_SESSIONS_UPDATED_EVENT, handleSessionUpdate);
        };
    }, [accountId]);

    useEffect(() => {
        const refreshSessions = async () => {
            try {
                const data = await fetchAllHistory({ account_id: accountId });
                const sessionItems = Object.entries(data.sessions)
                    .map(([sessionId, history]) => buildSessionPreview(
                        sessionId,
                        history,
                        data.session_started_at[sessionId] ?? "",
                    ));
                setSessions(sessionItems);
            } catch {
                setSessions([]);
            }
        };

        void refreshSessions();
    }, [accountId, pathname]);

    const handleDeleteSession = async (sessionId: string) => {
        if (deletingIds.has(sessionId)) return;
        setDeletingIds((prev) => new Set(prev).add(sessionId));
        try {
            await clearChatSession({ account_id: accountId, session_id: sessionId });
            setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
            if (activeSessionId === sessionId) {
                handleNewChat();
            }
        } catch {
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(sessionId);
                return next;
            });
        }
    };

    return (
        <nav className={`fixed left-0 top-0 h-full bg-[#1b1e22]/85 backdrop-blur-2xl text-white flex flex-col gap-4 border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-50 w-72 p-4 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 ${isCollapsed ? "md:w-20 md:p-3" : "md:w-72 md:p-4"}`}>
            <div className={`flex items-center ${!showFull ? "justify-center" : "justify-between"}`}>
                {showFull && (
                    <button
                        type="button"
                        onClick={handleNewChat}
                        className="flex items-center gap-2 group transition-opacity hover:opacity-90 cursor-pointer text-left"
                    >
                        <Image src={images.LOGO} width={80} height={32} alt={`${APP_NAME} logo`} className="object-contain drop-shadow-[0_4px_12px_rgba(118,164,255,0.25)]" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onToggle}
                    className="hidden md:inline-flex items-center justify-center rounded-xl p-1.5 text-white/70 border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:text-white hover:border-white/25 transition-all"
                    aria-label={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
                >
                    {isCollapsed ? <ChevronLastIcon size={18} /> : <ChevronFirstIcon size={18} />}
                </button>
                <button
                    type="button"
                    onClick={onMobileClose}
                    className="md:hidden inline-flex items-center justify-center rounded-xl p-1.5 text-white/70 border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:text-white hover:border-white/25 transition-all"
                    aria-label="Закрыть меню"
                >
                    <X size={18} />
                </button>
            </div>

            <div>
                <button
                    type="button"
                    className={`primary-button w-full shadow-[0_8px_20px_rgba(0,0,0,0.25)] ${!showFull ? "justify-center px-0 py-2.5" : "justify-start gap-2.5 px-4 py-2.5"}`}
                    onClick={handleNewChat}
                >
                    <Plus size={18} className="text-[#76a4ff]" />
                    {showFull && <span className="text-sm font-medium">Новый чат</span>}
                </button>
            </div>

            {showFull && <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-1" />}

            {showFull && (
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="text-xs uppercase tracking-wider text-white/40 px-2 py-1.5 font-medium">История чатов</div>

                    <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1">
                        {isLoading && sessions.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <li key={i} className="px-2 py-2">
                                    <Skeleton className="h-7 w-full bg-white/5 rounded-lg" />
                                </li>
                            ))
                        ) : sessions.length === 0 ? (
                            <li className="px-3 py-6 text-center text-xs text-white/40">
                                У вас пока нет сохранённых чатов
                            </li>
                        ) : (
                            sessions.map((item) => {
                                const isActive = activeSessionId === item.sessionId;
                                const isDeleting = deletingIds.has(item.sessionId);

                                return (
                                    <li key={item.sessionId} className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.push(`/${item.sessionId}`);
                                                onMobileClose();
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-between pr-8 border ${
                                                isActive
                                                    ? "bg-[#252a30] text-white border-white/15 font-medium shadow-sm"
                                                    : "text-white/70 hover:text-white hover:bg-white/[0.06] border-transparent"
                                            }`}
                                        >
                                            <span className="truncate">{item.preview}</span>
                                        </button>

                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button
                                                        type="button"
                                                        disabled={isDeleting}
                                                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                                        aria-label="Удалить чат"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="surface-panel border-white/15 bg-[#1b1e22]/95 backdrop-blur-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-white">
                                                            Удалить этот чат?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-white/60">
                                                            История этого диалога будет удалена навсегда без возможности восстановления.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                                                            Отмена
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteSession(item.sessionId)}
                                                            className="bg-red-500/80 hover:bg-red-500 text-white border-0"
                                                        >
                                                            Удалить
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}

            <div className={`mt-auto ${showFull ? "pt-2 border-t border-white/10" : ""}`}>
                <UserMenu isCollapsed={!showFull} />
            </div>
        </nav>
    );
}
