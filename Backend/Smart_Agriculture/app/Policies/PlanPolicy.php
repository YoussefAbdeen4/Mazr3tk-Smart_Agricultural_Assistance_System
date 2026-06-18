<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\Plan;
use App\Models\User;

class PlanPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Plan $plan): bool
    {
        $farm = $plan->farm;
        if ($farm->user_id === $user->id) {
            return true;
        }
        return $farm->users()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Farm $farm): bool
    {
        if ($farm->user_id === $user->id) {
            return true;
        }
        return $farm->users()->where('user_id', $user->id)->wherePivot('role', 'editor')->exists();
    }

    public function update(User $user, Plan $plan): bool
    {
        $farm = $plan->farm;
        if ($farm->user_id === $user->id) {
            return true;
        }
        return $farm->users()->where('user_id', $user->id)->wherePivot('role', 'editor')->exists();
    }

    public function delete(User $user, Plan $plan): bool
    {
        $farm = $plan->farm;
        if ($farm->user_id === $user->id) {
            return true;
        }
        return $farm->users()->where('user_id', $user->id)->wherePivot('role', 'editor')->exists();
    }
}