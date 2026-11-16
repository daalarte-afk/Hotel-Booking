"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
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

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await apiClient("/auth/register", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            router.push(CONFIG.ROUTES.LOGIN);
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
                            Staff Onboarding
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Grand Stay Hotel
                        </h1>
                        <p className="mt-3 text-sm text-stone-300 leading-relaxed">
                            Create an authorized front-desk account to manage guest reservations, room assignments, and booking statuses.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-800 space-y-2 text-xs text-stone-300">
                        <p className="font-semibold text-amber-300 uppercase tracking-wider">Included Access</p>
                        <p>✓ Create &amp; confirm room reservations</p>
                        <p>✓ View detailed booking receipts</p>
                        <p>✓ Update check-in and room status</p>
                    </div>
                </div>

                <Card className="border-0 rounded-none shadow-none flex flex-col justify-center py-4">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Account</CardTitle>
                        <CardDescription>
                            Register a new front-desk account to get started.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
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
                                    placeholder="Choose a staff username"
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
                                {loading ? "Registering..." : "Register"}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{" "}
                                <Link href={CONFIG.ROUTES.LOGIN} className="text-amber-700 font-medium underline">
                                    Login
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
