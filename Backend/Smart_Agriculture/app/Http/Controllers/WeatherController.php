<?php

namespace App\Http\Controllers;

use App\Http\Resources\WeatherResource;
use App\Http\Traits\ApiTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    use ApiTrait;

    public function getForecast(Request $request)
    {
        $request->validate([
            'city' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lon' => 'nullable|numeric',
        ]);

        $apiKey = env('OPENWEATHER_API_KEY');
        $baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

        $queryParams = [
            'appid' => $apiKey,
            'units' => 'metric',
            'lang' => 'en',
        ];

        if ($request->has('lat') && $request->has('lon')) {
            $queryParams['lat'] = $request->lat;
            $queryParams['lon'] = $request->lon;
        } elseif ($request->has('city')) {
            $queryParams['q'] = $request->city;
        } else {
            return $this->errorResponse(
                ['location' => ['يرجى إرسال اسم المدينة أو الإحداثيات']],
                'Location missing',
                400
            );
        }

        try {
            $response = Http::get($baseUrl, $queryParams);

            if ($response->failed()) {
                return $this->errorResponse(
                    ['weather' => ['لم نتمكن من جلب بيانات الطقس، تأكد من صحة الموقع.']],
                    'Weather API Error',
                    $response->status()
                );
            }
            return $this->dataResponse(
                new WeatherResource($response->json()),
                'Weather data retrieved successfully'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(['server' => [$e->getMessage()]], 'Server Error', 500);
        }
    }
}
