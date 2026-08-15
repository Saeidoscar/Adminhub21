<?php

namespace App\Actions\Tickets;

use App\Enums\UserRole;
use App\Models\TicketDepartment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateTicketDepartmentAction
{
    /**
     * @param  array{is_active:bool,is_default:bool,sort_order:int,supporter_ids:array<int,int>}  $data
     */
    public function execute(TicketDepartment $department, array $data): TicketDepartment
    {
        return DB::transaction(function () use ($department, $data): TicketDepartment {
            if ($data['is_default'] && ! $data['is_active']) {
                throw ValidationException::withMessages([
                    'is_active' => 'دپارتمان پیش‌فرض باید فعال باشد.',
                ]);
            }

            if (
                $department->is_default
                && ! $data['is_default']
                && ! TicketDepartment::query()->whereKeyNot($department->id)->where('is_default', true)->exists()
            ) {
                throw ValidationException::withMessages([
                    'is_default' => 'ابتدا یک دپارتمان فعال دیگر را به‌عنوان پیش‌فرض انتخاب کنید.',
                ]);
            }

            $supporters = User::query()
                ->whereIn('id', $data['supporter_ids'])
                ->get();

            if ($supporters->contains(fn (User $user) => $user->role !== UserRole::ADMIN)) {
                throw ValidationException::withMessages([
                    'supporter_ids' => 'تمام پشتیبان‌ها باید دسترسی مدیریتی داشته باشند.',
                ]);
            }

            if ($data['is_default']) {
                TicketDepartment::query()
                    ->whereKeyNot($department->id)
                    ->update(['is_default' => false]);
            }

            $department->update([
                'is_active' => $data['is_active'],
                'is_default' => $data['is_default'],
                'sort_order' => $data['sort_order'],
            ]);
            $department->supporters()->sync($supporters->modelKeys());

            return $department->fresh('supporters');
        });
    }
}
