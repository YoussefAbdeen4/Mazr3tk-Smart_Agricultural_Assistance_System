<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WeatherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'city' => $this['name'] ?? null,
            'country' => $this['sys']['country'] ?? null,
            'status' => $this['weather'][0]['description'] ?? null,
            'measurements' => [
                'temperature' => $this['main']['temp'] ?? null,
                'temp_max' => $this['main']['temp_max'] ?? null,
                'temp_min' => $this['main']['temp_min'] ?? null,
                'humidity' => ($this['main']['humidity'] ?? 0) . '%',
            ],
            'wind_speed' => ($this['wind']['speed'] ?? 0) . ' m/s',
        ];
    }
}