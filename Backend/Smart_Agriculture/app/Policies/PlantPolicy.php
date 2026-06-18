<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\Plant;
use App\Models\User;

class PlantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Plant $plant): bool
    {
        $farm = $plant->farm;
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

    public function update(User $user, Plant $plant): bool
    {
        $farm = $plant->farm;
        if ($farm->user_id === $user->id) {
            return true;
        }
        return $farm->users()->where('user_id', $user->id)->wherePivot('role', 'editor')->exists();
    }

    public function delete(User $user, Plant $plant): bool
    {
        $farm = $plant->farm;
        if ($farm->user_id === $user->id) {
            return true;
        }
        return $farm->users()->where('user_id', $user->id)->wherePivot('role', 'editor')->exists();
    }
}