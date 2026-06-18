<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InsectDetectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'insect' => [
                'name' => $this['classification_result']['insect_name_ar'] ?? null,
                'name_en' => $this['classification_result']['insect_name_en'] ?? null,
                'danger_level' => $this['classification_result']['danger_level'] ?? null,
            ],
            'details' => [
                'description' => $this['insect_info']['description'] ?? null,
                'affected_crops' => $this['insect_info']['affected_crops'] ?? [],
                'season' => $this['insect_info']['appearance_season'] ?? null,
            ],
            'recommendation' => [
                'action' => $this['immediate_recommendation']['required_action'] ?? null,
                'warning' => $this['immediate_recommendation']['warning'] ?? null,
            ],
            'note' => $this['note'] ?? null,
        ];
    }
}
