"use client";

import { useClerk, useUser, UserAvatar } from "@clerk/nextjs";
import { LogOut, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type UserMenuProps = {
    isCollapsed?: boolean;
};
        
export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
    const { user } = useUser();
    const { openUserProfile, signOut } = useClerk();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`w-full rounded-md text-left transition-colors hover:bg-neutral-800 ${isCollapsed ? "p-1" : "px-2 py-2"}`}
                    aria-label="Меню аккаунта"
                >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                        <UserAvatar />
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium truncate">{user?.username ?? user?.firstName ?? "Пользователь"}</div>
                                <div className="text-xs text-neutral-500">Аккаунт</div>
                            </div>
                        )}
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side="top"
                align={isCollapsed ? "start" : "end"}
                className="w-56 border-neutral-800 bg-neutral-900"
            >
                <DropdownMenuItem
                    className="gap-2 cursor-pointer focus:bg-neutral-800 text-neutral-100"
                    onSelect={() => {
                        openUserProfile();
                    }}
                >
                    <Settings size={16} />
                    <span>Настройки аккаунта</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    variant="destructive"
                    className="gap-2 cursor-pointer focus:bg-neutral-800"
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
