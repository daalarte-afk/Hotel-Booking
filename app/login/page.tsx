"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      setTokens(data.accessToken, data.refreshToken);
      router.push(CONFIG.ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden border border-stone-700/50 bg-background">
        <div className="bg-stone-900 text-white p-8 md:p-10 flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full mb-4">
              Hospitality Portal
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              Grand Stay Hotel
            </h1>
            <p className="mt-3 text-sm text-stone-300 leading-relaxed">
              Front-desk and reservation management system. Sign in to manage room availability, guest check-ins, and active bookings.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-800 space-y-3 text-xs text-stone-400">
            <div className="flex items-center justify-between">
              <span>Room Tiers</span>
              <span className="text-stone-200 font-medium">Standard • Deluxe • Suite</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Front Desk</span>
              <span className="text-emerald-400 font-medium">● System Online</span>
            </div>
          </div>
        </div>

        <Card className="border-0 rounded-none shadow-none flex flex-col justify-center py-4">
          <CardHeader>
            <CardTitle className="text-2xl">Staff Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the reservation dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter staff username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Access Booking Dashboard"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don&apos;t have a staff account?{" "}
                <Link href={CONFIG.ROUTES.REGISTER} className="text-amber-700 font-medium underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
