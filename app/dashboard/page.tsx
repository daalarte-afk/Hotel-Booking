"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { clearTokens, isAuthenticated } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface BookingRecord {
    id: number;
    position_code: string;
    position_name: string;
    created_at?: string;
    createdAt?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Array<BookingRecord>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
    const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
    const [roomNumber, setRoomNumber] = useState("");
    const [roomCategory, setRoomCategory] = useState("Deluxe");
    const [guestName, setGuestName] = useState("");
    const [bookingStatus, setBookingStatus] = useState("Confirmed");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push(CONFIG.ROUTES.LOGIN);
            return;
        }
        fetchBookings();
    }, [router]);

    const handleAuthError = (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("401") || msg.includes("403") || msg.toLowerCase().includes("forbidden") || msg.toLowerCase().includes("token")) {
            clearTokens();
            router.push(CONFIG.ROUTES.LOGIN);
            return true;
        }
        return false;
    };

    const fetchBookings = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiClient<Array<BookingRecord> | { data: Array<BookingRecord> }>(CONFIG.ENDPOINTS.POSITIONS, { method: "GET", requiresAuth: true });
            setBookings(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
        } catch (err: unknown) {
            if (!handleAuthError(err)) setError(err instanceof Error ? err.message : "Failed to fetch bookings.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReadSingle = async (id: number) => {
        setError("");
        setIsCreating(false);
        setEditingBooking(null);
        try {
            const data = await apiClient<BookingRecord | Array<BookingRecord>>(`${CONFIG.ENDPOINTS.POSITIONS}/${id}`, { method: "GET", requiresAuth: true });
            setSelectedBooking(Array.isArray(data) ? (data.at(0) ?? null) : data);
        } catch (err: unknown) {
            if (!handleAuthError(err)) setError(err instanceof Error ? err.message : "Failed to fetch booking.");
        }
    };

    const resetFields = () => {
        setRoomNumber("");
        setRoomCategory("Deluxe");
        setGuestName("");
        setBookingStatus("Confirmed");
    };

    const openCreateForm = () => {
        setSelectedBooking(null);
        setEditingBooking(null);
        resetFields();
        setIsCreating(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await apiClient(CONFIG.ENDPOINTS.POSITIONS, {
                method: "POST",
                requiresAuth: true,
                body: JSON.stringify({ position_code: `RM-${roomNumber} (${roomCategory})`, position_name: `${guestName} [${bookingStatus}]` }),
            });
            setIsCreating(false);
            resetFields();
            await fetchBookings();
        } catch (err: unknown) {
            if (!handleAuthError(err)) setError(err instanceof Error ? err.message : "Failed to create booking.");
        } finally {
            setSubmitting(false);
        }
    };

    const openUpdateForm = (booking: BookingRecord) => {
        setSelectedBooking(null);
        setIsCreating(false);
        setEditingBooking(booking);
        const roomMatch = booking.position_code?.match(/^RM-(.+?)\s*\((.+?)\)$/);
        setRoomNumber(roomMatch ? (roomMatch.at(1) || "") : (booking.position_code || ""));
        setRoomCategory(roomMatch ? (roomMatch.at(2) || "Deluxe") : "Deluxe");
        const guestMatch = booking.position_name?.match(/^(.+?)\s*\[(.+?)\]$/);
        setGuestName(guestMatch ? (guestMatch.at(1) || "") : (booking.position_name || ""));
        setBookingStatus(guestMatch ? (guestMatch.at(2) || "Confirmed") : "Confirmed");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;
        setSubmitting(true);
        setError("");
        try {
            await apiClient(`${CONFIG.ENDPOINTS.POSITIONS}/${editingBooking.id}`, {
                method: "PUT",
                requiresAuth: true,
                body: JSON.stringify({ position_code: `RM-${roomNumber} (${roomCategory})`, position_name: `${guestName} [${bookingStatus}]` }),
            });
            setEditingBooking(null);
            resetFields();
            await fetchBookings();
        } catch (err: unknown) {
            if (!handleAuthError(err)) setError(err instanceof Error ? err.message : "Failed to update booking.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Delete Booking #${id}?`)) return;
        setError("");
        try {
            await apiClient(`${CONFIG.ENDPOINTS.POSITIONS}/${id}`, { method: "DELETE", requiresAuth: true });
            if (selectedBooking?.id === id) setSelectedBooking(null);
            if (editingBooking?.id === id) setEditingBooking(null);
            await fetchBookings();
        } catch (err: unknown) {
            if (!handleAuthError(err)) setError(err instanceof Error ? err.message : "Failed to delete booking.");
        }
    };

    const handleLogout = () => {
        clearTokens();
        router.push(CONFIG.ROUTES.LOGIN);
    };

    const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleDateString("en-US") : "N/A");
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const confirmedCount = safeBookings.filter((b) => b.position_name?.toLowerCase().includes("confirmed")).length;
    const checkedInCount = safeBookings.filter((b) => b.position_name?.toLowerCase().includes("checked in")).length;

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <header className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <span className="px-2.5 py-0.5 text-xs font-semibold uppercase bg-amber-500/20 text-amber-300 rounded-full">
                            GET • POST • PUT • DELETE Active
                        </span>
                        <h1 className="text-2xl font-bold mt-1">Grand Stay Hotel — Reservation Dashboard</h1>
                    </div>
                    <button onClick={handleLogout} className="px-4 py-2 text-xs font-semibold text-amber-200 bg-white/10 rounded-lg hover:bg-red-600 hover:text-white">
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-stone-200">
                        <p className="text-xs font-semibold uppercase text-stone-500">Total Bookings</p>
                        <p className="text-2xl font-bold mt-1">{safeBookings.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-stone-200">
                        <p className="text-xs font-semibold uppercase text-stone-500">Confirmed Stays</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{confirmedCount}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-stone-200">
                        <p className="text-xs font-semibold uppercase text-stone-500">Checked In</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{checkedInCount}</p>
                    </div>
                </div>

                {error && <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>}

                {isCreating && (
                    <div className="bg-white p-6 rounded-xl border-2 border-amber-500/40 shadow-md">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-bold">POST /positions — New Booking</h2>
                            <button onClick={() => setIsCreating(false)} className="font-bold">×</button>
                        </div>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" required placeholder="Room Number (e.g. 101)" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="px-3 py-2 text-sm border rounded-lg" />
                            <select value={roomCategory} onChange={(e) => setRoomCategory(e.target.value)} className="px-3 py-2 text-sm border rounded-lg bg-white">
                                <option>Deluxe</option>
                                <option>Suite</option>
                                <option>Standard</option>
                                <option>Family</option>
                            </select>
                            <input type="text" required placeholder="Guest Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="px-3 py-2 text-sm border rounded-lg" />
                            <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)} className="px-3 py-2 text-sm border rounded-lg bg-white">
                                <option>Confirmed</option>
                                <option>Checked In</option>
                                <option>Checked Out</option>
                                <option>Pending</option>
                            </select>
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs bg-stone-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg">
                                    {submitting ? "Saving..." : "POST • Create Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {editingBooking && (
                    <div className="bg-white p-6 rounded-xl border-2 border-amber-500/40 shadow-md">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-bold">PUT /positions/{editingBooking.id} — Edit Booking</h2>
                            <button onClick={() => setEditingBooking(null)} className="font-bold">×</button>
                        </div>
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="px-3 py-2 text-sm border rounded-lg" />
                            <select value={roomCategory} onChange={(e) => setRoomCategory(e.target.value)} className="px-3 py-2 text-sm border rounded-lg bg-white">
                                <option>Deluxe</option>
                                <option>Suite</option>
                                <option>Standard</option>
                                <option>Family</option>
                            </select>
                            <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} className="px-3 py-2 text-sm border rounded-lg" />
                            <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)} className="px-3 py-2 text-sm border rounded-lg bg-white">
                                <option>Confirmed</option>
                                <option>Checked In</option>
                                <option>Checked Out</option>
                                <option>Pending</option>
                            </select>
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingBooking(null)} className="px-4 py-2 text-xs bg-stone-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 rounded-lg">
                                    {submitting ? "Saving..." : "PUT • Update Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {selectedBooking && (
                    <div className="bg-stone-900 text-white p-6 rounded-xl">
                        <div className="flex justify-between mb-3">
                            <h2 className="font-bold text-amber-300">GET /positions/{selectedBooking.id} — Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="font-bold">×</button>
                        </div>
                        <p className="text-sm">Room: {selectedBooking.position_code} | Guest: {selectedBooking.position_name} | Created: {formatDate(selectedBooking.created_at ?? selectedBooking.createdAt)}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b bg-stone-50">
                        <h2 className="font-bold">Bookings List (GET /positions)</h2>
                        <div className="flex gap-2">
                            <button onClick={fetchBookings} className="px-3 py-2 text-xs font-semibold border rounded-lg bg-white">Refresh (GET)</button>
                            <button onClick={openCreateForm} className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg">+ New Booking (POST)</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-sm text-stone-500">Loading bookings...</div>
                    ) : safeBookings.length === 0 ? (
                        <div className="p-8 text-center text-sm text-stone-500">No bookings available.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-stone-200">
                            <thead className="bg-stone-100 text-xs uppercase text-stone-600">
                                <tr>
                                    <th className="px-6 py-3 text-left">ID</th>
                                    <th className="px-6 py-3 text-left">Room</th>
                                    <th className="px-6 py-3 text-left">Guest</th>
                                    <th className="px-6 py-3 text-left">Created</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-sm">
                                {safeBookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-amber-50/40">
                                        <td className="px-6 py-4 font-semibold">#{b.id}</td>
                                        <td className="px-6 py-4">{b.position_code}</td>
                                        <td className="px-6 py-4">{b.position_name}</td>
                                        <td className="px-6 py-4">{formatDate(b.created_at ?? b.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleReadSingle(b.id)} className="text-xs font-semibold text-amber-700">View</button>
                                                <button onClick={() => openUpdateForm(b)} className="text-xs font-semibold text-stone-700">Edit</button>
                                                <button onClick={() => handleDelete(b.id)} className="text-xs font-semibold text-red-600">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}