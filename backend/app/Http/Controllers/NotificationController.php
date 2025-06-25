<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('idPengguna', $request->user()->idPengguna)
                            ->orderBy('created_at', 'desc');

        if ($request->has('filter')) {
            if ($request->filter === 'unread') {
                $query->unread();
            } elseif ($request->filter === 'read') {
                $query->read();
            }
        }

        // Support for type filtering
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Support for admin system status filtering
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Support for jenis notifikasi filtering (admin compatibility)
        if ($request->has('jenisNotifikasi')) {
            $query->byJenisNotifikasi($request->jenisNotifikasi);
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        return response()->json($notifications);
    }

    public function recent(Request $request)
    {
        $notifications = Notification::where('idPengguna', $request->user()->idPengguna)
                                   ->orderBy('created_at', 'desc')
                                   ->limit($request->get('limit', 5))
                                   ->get();

        return response()->json($notifications);
    }

    /**
     * Admin system compatibility - get latest notifications
     */
    public function getNotifikasiTerbaru(Request $request)
    {
        $notifications = Notification::where('idPengguna', $request->user()->idPengguna)
                                   ->orderBy('created_at', 'desc')
                                   ->limit(5)
                                   ->get()
                                   ->map(function($notification) {
                                       return $notification->toAdminFormat();
                                   });

        return response()->json($notifications);
    }

    /**
     * Admin system compatibility - get all notifications with status filter
     */
    public function getSemuaNotifikasi(Request $request)
    {
        $status = $request->query('status', 'SEMUA');

        if (!in_array($status, ['BACA', 'BELUM TERBACA', 'SEMUA'])) {
            return response()->json(['message' => 'Status tidak valid'], 400);
        }

        $query = Notification::where('idPengguna', $request->user()->idPengguna)
                            ->orderBy('created_at', 'desc');

        if ($status === 'BACA') {
            $query->read();
        } elseif ($status === 'BELUM TERBACA') {
            $query->unread();
        }
        
        $notifications = $query->get()->map(function($notification) {
            return $notification->toAdminFormat();
        });

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $notification = Notification::where('id', $id)
                                      ->where('idPengguna', $request->user()->idPengguna)
                                      ->firstOrFail();

            $notification->markAsRead();

            Log::info('Notification marked as read', [
                'notification_id' => $id,
                'user_id' => $request->user()->idPengguna
            ]);

            return response()->json([
                'message' => 'Notification marked as read',
                'notification' => $notification->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking notification as read', [
                'notification_id' => $id,
                'user_id' => $request->user()->idPengguna,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to mark notification as read'], 500);
        }
    }

    /**
     * Admin system compatibility - tandai terbaca
     */
    public function tandaiTerbaca(Request $request, $id)
    {
        $notif = Notification::where('id', $id)
                            ->where('idPengguna', $request->user()->idPengguna)
                            ->first();
        
        if (!$notif) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notif->markAsRead();

        return response()->json(['message' => 'Berhasil ditandai sudah dibaca dengan status BACA']);
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $updatedCount = Notification::where('idPengguna', $request->user()->idPengguna)
                           ->whereNull('read_at')
                           ->update(['read_at' => now()]);

            Log::info('All notifications marked as read', [
                'user_id' => $request->user()->idPengguna,
                'updated_count' => $updatedCount
            ]);

            return response()->json([
                'message' => 'All notifications marked as read',
                'updated_count' => $updatedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read', [
                'user_id' => $request->user()->idPengguna,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to mark all notifications as read'], 500);
        }
    }

    public function getUnreadCount(Request $request)
    {
        try {
            $count = Notification::where('idPengguna', $request->user()->idPengguna)
                                ->whereNull('read_at')
                                ->count();

            return response()->json(['count' => $count]);

        } catch (\Exception $e) {
            Log::error('Error getting unread count', [
                'user_id' => $request->user()->idPengguna,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to get unread count'], 500);
        }
    }

    /**
     * Get notifications by type (consultation, simulation, etc.)
     */
    public function getByType(Request $request, $type)
    {
        try {
            $validTypes = ['consultation', 'simulation', 'feedback', 'admin', 'general'];
            
            if (!in_array($type, $validTypes)) {
                return response()->json(['error' => 'Invalid notification type'], 400);
            }

            $notifications = Notification::where('idPengguna', $request->user()->idPengguna)
                                       ->where('type', $type)
                                       ->orderBy('created_at', 'desc')
                                       ->paginate($request->get('per_page', 20));

            return response()->json($notifications);

        } catch (\Exception $e) {
            Log::error('Error getting notifications by type', [
                'user_id' => $request->user()->idPengguna,
                'type' => $type,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to get notifications'], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, $id)
    {
        try {
            $notification = Notification::where('id', $id)
                                      ->where('idPengguna', $request->user()->idPengguna)
                                      ->firstOrFail();

            $notification->delete();

            Log::info('Notification deleted', [
                'notification_id' => $id,
                'user_id' => $request->user()->idPengguna
            ]);

            return response()->json(['message' => 'Notification deleted successfully']);

        } catch (\Exception $e) {
            Log::error('Error deleting notification', [
                'notification_id' => $id,
                'user_id' => $request->user()->idPengguna,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to delete notification'], 500);
        }
    }

    /**
     * Get notification statistics
     */
    public function getStats(Request $request)
    {
        try {
            $userId = $request->user()->idPengguna;
            
            $stats = [
                'total' => Notification::where('idPengguna', $userId)->count(),
                'unread' => Notification::where('idPengguna', $userId)->unread()->count(),
                'by_type' => [
                    'consultation' => Notification::where('idPengguna', $userId)->consultation()->count(),
                    'simulation' => Notification::where('idPengguna', $userId)->simulation()->count(),
                    'feedback' => Notification::where('idPengguna', $userId)->feedback()->count(),
                    'admin' => Notification::where('idPengguna', $userId)->admin()->count(),
                ],
                'unread_by_type' => [
                    'consultation' => Notification::where('idPengguna', $userId)->consultation()->unread()->count(),
                    'simulation' => Notification::where('idPengguna', $userId)->simulation()->unread()->count(),
                    'feedback' => Notification::where('idPengguna', $userId)->feedback()->unread()->count(),
                    'admin' => Notification::where('idPengguna', $userId)->admin()->unread()->count(),
                ]
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Error getting notification stats', [
                'user_id' => $request->user()->idPengguna,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to get notification stats'], 500);
        }
    }

    /**
     * Create notification via API (for admin/manual purposes)
     */
    public function create(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:pengguna,idPengguna',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'in:general,consultation,simulation,feedback,admin',
            'metadata' => 'nullable|array'
        ]);

        try {
            $notification = Notification::create([
                'idPengguna' => $request->user_id,
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type ?? Notification::TYPE_GENERAL,
                'metadata' => $request->metadata ?? []
            ]);

            Log::info('Notification created via API', [
                'notification_id' => $notification->id,
                'user_id' => $request->user_id,
                'type' => $notification->type
            ]);

            return response()->json([
                'message' => 'Notification created successfully',
                'notification' => $notification
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating notification via API', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json(['error' => 'Failed to create notification'], 500);
        }
    }
}