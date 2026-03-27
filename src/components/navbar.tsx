"use client"

import { clearChatSession, fetchAllHistory } from "@/app/api/chat";
import type { ChatMessage } from "@/app/api/types";
import { useUser } from "@clerk/nextjs";
import { ChevronFirstIcon, ChevronLastIcon, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import UserMenu from "./user-menu";
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
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";

const CHAT_SESSIONS_UPDATED_EVENT = "chat-sessions-updated";

type NavbarProps = {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
};

type SessionItem = {
    sessionId: string;
    preview: string;
    startedAt: string;
};

function buildSessionPreview(
    sessionId: string,
    history: ChatMessage[],
    startedAt: string,
): SessionItem {
    const firstUserMessage = history.find((message) => message.role === "user")?.content;
    const fallback = `Чат ${sessionId.slice(0, 8)}`;
    const preview = (firstUserMessage ?? fallback).trim();

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

    const accountId = user?.id ?? "guest";
    const showFull = !isCollapsed || isMobileOpen;

    const activeSessionId = useMemo(() => {
        if (pathname === "/") {
            return null;
        }

        return pathname.slice(1);
    }, [pathname]);

    useEffect(() => {
        let isMounted = true;

        const loadAllSessions = async () => {
            setIsLoading(true);
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
            void loadAllSessions();
        };

        void loadAllSessions();
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
                router.push("/");
            }
        } catch {
            // silently fail
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(sessionId);
                return next;
            });
        }
    };

    return (
        <nav className={`fixed left-0 top-0 h-full bg-neutral-900 text-neutral-100 flex flex-col gap-4 shadow-lg transition-all duration-300 z-50 w-72 p-4 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 ${isCollapsed ? "md:w-20 md:p-3" : "md:w-72 md:p-4"}`}>
            <div className={`flex items-center ${!showFull ? "justify-center" : "justify-between"}`}>
                {showFull && (
                    <Image src="/logo.png" width={160} height={36} alt="Qual AI logo" className="object-contain" />
                )}
                {/* Desktop: collapse toggle */}
                <button
                    type="button"
                    onClick={onToggle}
                    className="hidden md:inline-flex items-center justify-center rounded-md p-1 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    aria-label={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
                >
                    {isCollapsed ? <ChevronLastIcon /> : <ChevronFirstIcon />}
                </button>
                {/* Mobile: close button */}
                <button
                    type="button"
                    onClick={onMobileClose}
                    className="md:hidden inline-flex items-center justify-center rounded-md p-1 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    aria-label="Закрыть меню"
                >
                    <X size={20} />
                </button>
            </div>

            <div>
                <Button
                    className={`${!showFull ? "w-full justify-center px-0" : "w-full justify-start gap-2"}`}
                    variant={"outline"}
                    onClick={() => { router.push("/"); onMobileClose(); }}
                >
                    <Plus />
                    {showFull && <span>Новый чат</span>}
                </Button>
            </div>

            {showFull && <Separator />}

            {showFull && (
                <ul className="flex-1 overflow-y-auto overflow-x-hidden">
                    <li className="text-sm text-neutral-400 p-2">Все чаты</li>

                    {isLoading && (
                        <li className="space-y-2 p-2">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-[92%]" />
                            <Skeleton className="h-9 w-[85%]" />
                        </li>
                    )}

                    {!isLoading && sessions.length === 0 && (
                        <li className="p-2 text-sm text-neutral-500">Чатов пока нет</li>
                    )}

                    {sessions.map((session) => {
                        const isActive = session.sessionId === activeSessionId;

                        return (
                            <li
                                key={session.sessionId}
                                onClick={() => { router.push(`/${session.sessionId}`); onMobileClose(); }}
                                className={`flex items-center justify-between p-2 m-1 rounded-md cursor-pointer group ${
                                    isActive ? "bg-neutral-700" : "hover:bg-neutral-800"
                                }`}
                                title={session.preview}
                            >
                                <span className="truncate flex-1 min-w-0 text-sm">{session.preview}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={deletingIds.has(session.sessionId)}
                                            className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 transition-opacity disabled:opacity-50"
                                            aria-label="Удалить чат"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Это действие нельзя отменить. Чат будет удалён без возможности восстановления.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-600 text-white hover:bg-red-700"
                                                disabled={deletingIds.has(session.sessionId)}
                                                onClick={() => handleDeleteSession(session.sessionId)}
                                            >
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className={`mt-2 border-t border-neutral-800 pt-3`}>
                <UserMenu isCollapsed={isCollapsed} />
            </div>
        </nav>
    );
}
