<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\User;

class FarmPolicy
{
    /**
     * Determine if the user can view any farms.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can view the farm.
     */
    public function view(User $user, Farm $farm): bool
    {
        if ($farm->user_id === $user->id) {
            return true;
        }

        return $farm->users()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine if the user can create farms.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the farm.
     */
    public function update(User $user, Farm $farm): bool
    {
        // تم التعديل: المالك فقط من يعدل المزرعة، الـ editor ممنوع هنا
        return $farm->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the farm.
     */
    public function delete(User $user, Farm $farm): bool
    {
        return $farm->user_id === $user->id;
    }

    /**
     * Determine if the user can grant access to the farm.
     */
    public function grantAccess(User $user, Farm $farm): bool
    {
        if ($farm->user_id === $user->id) {
            return true;
        }

        if ($user->role === 'engineer') {
            return $farm->users()
                ->where('user_id', $user->id)
                ->wherePivot('role', 'editor')
                ->exists();
        }

        return false;
    }
}