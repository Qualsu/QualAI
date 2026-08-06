"use client";

import { useClerk, useUser, UserAvatar } from "@clerk/nextjs";
import { LogOut, Settings } from "lucide-react";
import type { UserMenuProps } from "@/config/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

        
export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
    const { user } = useUser();
    const { openUserProfile, signOut } = useClerk();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`w-full rounded-xl text-left transition-all duration-200 border border-transparent hover:border-white/10 hover:bg-white/[0.06] ${isCollapsed ? "p-1.5 justify-center" : "px-3 py-2"}`}
                    aria-label="Меню аккаунта"
                >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                        <div className="ring-2 ring-purple-500/30 rounded-full">
                            <UserAvatar />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-white truncate">{user?.username ?? user?.firstName ?? "Пользователь"}</div>
                                <div className="text-xs text-white/50">Аккаунт Qual ID</div>
                            </div>
                        )}
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side="top"
                align={isCollapsed ? "start" : "end"}
                className="w-56 surface-panel border-white/15 bg-[#1e131d]/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-1.5"
            >
                <DropdownMenuItem
                    className="gap-2.5 cursor-pointer rounded-xl text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white transition-colors"
                    onSelect={() => {
                        openUserProfile();
                    }}
                >
                    <Settings size={16} className="text-purple-300" />
                    <span>Настройки аккаунта</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    variant="destructive"
                    className="gap-2.5 cursor-pointer rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/15 focus:bg-red-500/15 focus:text-red-300 transition-colors"
                    onSelect={async () => {
                        await signOut();
                    }}
                >
                    <LogOut size={16} />
                    <span>Выйти</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
