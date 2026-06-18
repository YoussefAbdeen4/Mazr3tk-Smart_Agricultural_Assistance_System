<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentUser = $request->user();

        // المنطق الديناميكي لتحديد الـ role
        if ($this->user_id === $currentUser->id) {
            $role = 'owner';
        } else {
            $pivotData = $this->users->first();
            // هيقرأ القيمة من الـ DB سواء كانت editor أو viewer
            $role = $pivotData ? $pivotData->pivot->role : 'no_access';
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'area' => $this->area,
            'location' => $this->location,
            'soil_type' => $this->soil_type,
            'img' => $this->img ? url('img/Farm/' . $this->img) : null,
            'user_role' => $role, // القيمة الديناميكية من الداتا بيز
        ];
    }
}
