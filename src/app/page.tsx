"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/pages/landing/navbar";
import { GoogleSignInButton } from "@/components/pages/landing/google-sign-in-button";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Rocket,
  ShieldCheck,
  Globe,
  Database,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  Loader2,
  Server,
} from "lucide-react";

export default function Home() {
  const { user, loading, dbSaving, dbSynced, error, clearError, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Error notification banner */}
        {error && (
          <div className="container mx-auto max-w-4xl px-4 pt-6">
            <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive shadow-xs">
              <div className="flex items-center gap-2.5 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={clearError}
                className="rounded-md p-1 hover:bg-destructive/15 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="container mx-auto max-w-5xl px-4 text-center">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                NASA Space Apps &bull; Firebase Auth &amp; Database
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground max-w-3xl mx-auto leading-tight">
              Explore Space with{" "}
              <span className="bg-linear-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                NASA Space Apps
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Authenticate securely with your Google account. Your profile is automatically
              stored in Cloud Firestore so you can access NASA datasets, participate in
              challenges, and collaborate.
            </p>

            {/* Auth Action Area */}
            <div className="mt-10 flex flex-col items-center justify-center">
              {loading ? (
                <div className="h-12 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
                  Initializing Firebase Authentication...
                </div>
              ) : user ? (
                /* Authenticated User Box (Solid Div) */
                <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-md text-left overflow-hidden">
                  {/* Header */}
                  <div className="px-6 pt-6 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Authenticated
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Firebase Auth
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-6 space-y-4 pt-1">
                    <div className="flex items-center gap-3.5">
                      <Avatar size="lg" className="ring-2 ring-primary/20">
                        {user.photoURL && (
                          <AvatarImage
                            src={user.photoURL}
                            alt={user.displayName || "User profile photo"}
                          />
                        )}
                        <AvatarFallback className="font-semibold text-base">
                          {user.displayName
                            ? user.displayName.slice(0, 2)
                            : user.email?.slice(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-foreground text-base truncate">
                          {user.displayName || "Google User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {/* Firestore Database Sync Status */}
                    <div className="rounded-lg border border-border bg-muted p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <Database className="h-3.5 w-3.5 text-primary" />
                          Firestore Database:
                        </span>
                        {dbSaving ? (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            Saving user...
                          </span>
                        ) : dbSynced ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1 px-1.5 py-0 text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Data Synced
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Connecting...
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Collection:</span>
                          <span className="text-foreground">users</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Doc ID:</span>
                          <span
                            className="text-foreground truncate max-w-[200px]"
                            title={user.uid}
                          >
                            {user.uid}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Project:</span>
                          <span className="text-foreground">nasa-spaces</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 flex justify-between border-t border-border bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => logout()}
                      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </Button>

                    <Link href="/dashboard">
                      <Button size="sm" className="gap-1.5 text-xs cursor-pointer">
                        <Rocket className="h-3.5 w-3.5" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Unauthenticated View: Sign In with Google */
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <GoogleSignInButton size="lg" className="h-12 px-6 text-base" />
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-6 text-base"
                      render={(props) => (
                        <a
                          {...props}
                          href="https://www.spaceappschallenge.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <span>About Challenge</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    One-click sign in powered by Google OAuth &amp; Firebase Firestore
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-12 border-t border-border bg-muted/20">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-center font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-8">
              Platform Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold leading-none tracking-tight mb-2">
                  Firebase Authentication
                </h3>
                <p className="text-sm text-muted-foreground">
                  Google OAuth 2.0 integration configured with client SDK for
                  instant, secure sign-in.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1 mb-4">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="font-semibold leading-none tracking-tight mb-2">
                  Cloud Firestore Database
                </h3>
                <p className="text-sm text-muted-foreground">
                  User profiles and session telemetry automatically stored and synchronized in real time.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2 mb-4">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-semibold leading-none tracking-tight mb-2">
                  NASA Space Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect your authenticated profile to earth observation,
                  satellite feeds, and challenge entries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NASA Space Apps Challenge &bull; Firebase project: nasa-spaces</span>
          <span className="font-mono">Next.js 16 &bull; React 19 &bull; Firestore Database</span>
        </div>
      </footer>
    </div>
  );
}