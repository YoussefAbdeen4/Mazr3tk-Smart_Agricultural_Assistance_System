<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiseaseDetectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'diagnosis' => [
                'plant_name' => $this['diagnosis']['plant'] ?? null,
                'disease_name' => $this['diagnosis']['disease'] ?? null,
                'status' => $this['diagnosis']['plant_status'] ?? null,
                'severity' => $this['diagnosis']['disease_severity'] ?? null,
            ],
            'action_plan' => [
                'treatment' => $this['treatment_and_prevention']['treatment_method'] ?? null,
                'prevention' => $this['treatment_and_prevention']['prevention'] ?? null,
                'pesticides' => $this['treatment_and_prevention']['recommended_pesticides'] ?? null,
            ],
            'advice' => $this['farmer_tip'] ?? null,
            'disclaimer' => $this['additional_info']['disclaimer'] ?? null,
        ];
    }
}
