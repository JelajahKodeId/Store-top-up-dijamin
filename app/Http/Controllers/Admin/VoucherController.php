<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Http\Requests\Admin\VoucherRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('viewAny', Voucher::class);
        $query = Voucher::latest();

        if ($request->search) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $vouchers = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Vouchers/Index', [
            'vouchers' => \App\Http\Resources\Admin\VoucherResource::collection($vouchers),
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function store(VoucherRequest $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('create', Voucher::class);
        
        try {
            Voucher::create($request->validated());
            return back()->with('success', 'Voucher berhasil ditambahkan.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Voucher store failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan voucher: ' . $e->getMessage());
        }
    }

    public function update(VoucherRequest $request, Voucher $voucher)
    {
        \Illuminate\Support\Facades\Gate::authorize('update', $voucher);
        
        try {
            $voucher->update($request->validated());
            return back()->with('success', 'Voucher berhasil diperbarui.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Voucher update failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui voucher: ' . $e->getMessage());
        }
    }

    public function destroy(Voucher $voucher)
    {
        \Illuminate\Support\Facades\Gate::authorize('delete', $voucher);
        
        try {
            if ($voucher->orders()->exists()) {
                return back()->with('error', 'Voucher tidak dapat dihapus karena sudah pernah digunakan.');
            }

            $voucher->delete();

            return back()->with('success', 'Voucher berhasil dihapus.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Voucher delete failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus voucher: ' . $e->getMessage());
        }
    }
}
