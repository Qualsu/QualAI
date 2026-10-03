"use client";

import { useClerk, useUser, UserAvatar } from "@clerk/nextjs";
import { Clock, LogOut, Settings, Sparkles } from "lucide-react";
import type { UserMenuProps } from "@/config/types";
import { useLimits } from "@/lib/limits-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { mainInfo, oldInfo } = useLimits();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`w-full rounded-xl text-left transition-all duration-200 border border-transparent hover:border-white/10 hover:bg-white/[0.06] ${
            isCollapsed ? "p-1.5 justify-center" : "px-3 py-2"
          }`}
          aria-label="Меню аккаунта"
        >
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="ring-2 ring-[#76a4ff]/40 rounded-full">
              <UserAvatar />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {user?.username ?? user?.firstName ?? "Пользователь"}
                </div>
                <div className="text-xs text-white/50">Аккаунт Qual ID</div>
              </div>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-72 sm:w-80 min-w-[280px] surface-panel border-white/15 bg-[#202328]/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-2 z-50"
      >
        {/* User Identity Header */}
        <div className="px-2.5 py-2 flex items-center gap-3">
          <div className="ring-2 ring-[#76a4ff]/40 rounded-full shrink-0">
            <UserAvatar />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">
              {user?.username ?? user?.firstName ?? "Пользователь"}
            </div>
            <div className="text-xs text-white/50 truncate">
              {user?.primaryEmailAddress?.emailAddress ?? "Аккаунт Qual ID"}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/10 my-1.5" />

        {/* Daily Limits Section */}
        <div className="px-2.5 py-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-2.5">
            <span className="flex items-center gap-1.5 text-white/90">
              <Sparkles size={14} className="text-[#76a4ff]" />
              Дневные лимиты
            </span>
            <span className="flex items-center gap-1 text-[11px] font-normal text-white/40">
              <Clock size={11} />
              Сброс в 00:00
            </span>
          </div>

          <div className="space-y-2">
            {/* Q.AI 3 & 3 Mini */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-white truncate pr-1">Q.AI 3 и 3 Mini</span>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    mainInfo.isExceeded ? "text-red-400" : "text-[#76a4ff]"
                  }`}
                >
                  {mainInfo.remaining} / {mainInfo.limit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    mainInfo.isExceeded
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-[#76a4ff] to-[#4f83f7]"
                  }`}
                  style={{ width: `${mainInfo.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-white/45">
                <span>Осталось запросов</span>
                <span>{mainInfo.used} исп.</span>
              </div>
            </div>

            {/* Old QualAI Models */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-white/90 truncate pr-1">Старые модели QualAI</span>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    oldInfo.isExceeded ? "text-red-400" : "text-[#76a4ff]"
                  }`}
                >
                  {oldInfo.remaining} / {oldInfo.limit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    oldInfo.isExceeded
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-[#76a4ff] to-[#4f83f7]"
                  }`}
                  style={{ width: `${oldInfo.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-white/45">
                <span>Осталось запросов</span>
                <span>{oldInfo.used} исп.</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/10 my-1.5" />

        {/* Actions */}
        <DropdownMenuItem
          className="gap-2.5 cursor-pointer rounded-xl text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white transition-colors"
          onSelect={() => {
            openUserProfile();
          }}
        >
          <Settings size={16} className="text-[#76a4ff]" />
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
