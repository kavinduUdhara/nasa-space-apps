"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { GoogleSignInButton } from "@/components/pages/landing/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rocket, LogOut, Loader2 } from "lucide-react";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Rocket className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base leading-none tracking-tight">
              NASA Space Apps
            </span>
            <span className="text-[11px] text-muted-foreground font-mono mt-0.5">
              space-apps portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs rounded-xl border-border/80 hover:bg-muted cursor-pointer"
            >
              <Rocket className="h-3.5 w-3.5 text-primary" />
              <span>3D Globe &amp; Explorer</span>
            </Button>
          </Link>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking session...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-2">
                <Avatar size="sm" className="ring-1 ring-border">
                  {user.photoURL && (
                    <AvatarImage
                      src={user.photoURL}
                      alt={user.displayName || "User avatar"}
                    />
                  )}
                  <AvatarFallback className="text-xs font-semibold uppercase">
                    {user.displayName
                      ? user.displayName.slice(0, 2)
                      : user.email?.slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium leading-none truncate max-w-[140px]">
                    {user.displayName || "Signed In"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <GoogleSignInButton size="sm" />
          )}
        </div>
      </div>
    </header>
  );
}
