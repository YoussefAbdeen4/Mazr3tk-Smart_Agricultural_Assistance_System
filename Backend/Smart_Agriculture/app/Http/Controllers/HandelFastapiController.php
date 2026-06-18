<?php

namespace App\Http\Controllers;

use App\Http\Resources\DiseaseDetectionResource;
use App\Http\Resources\InsectDetectionResource;
use App\Http\Traits\ApiTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Resources\CropYieldResource;
use Illuminate\Support\Facades\Validator;

class HandelFastapiController extends Controller
{
    use ApiTrait;


    public function plantDiseaseDetection(Request $request)
    {
        $request->validate([
            'img' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048']
        ]);

        $fastapiUrl = env('FASTAPI_URL') . '/predict';
        try {


            $image = $request->file('img');
            $response = Http::timeout(15)->attach(
                'file',
                file_get_contents($image->getPathname()),
                $image->getClientOriginalName()
            )->post($fastapiUrl);

            return $this->dataResponse(new DiseaseDetectionResource($response->json()), '', $response->status());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 'Internal Error', 500);
        }
    }

    public function pestDetection(Request $request)
    {
        $request->validate([
            'img' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048']
        ]);

        $fastapiUrl = env('FASTAPI_URL') . '/classify';
        try {


            $image = $request->file('img');
            $response = Http::timeout(15)->attach(
                'file',
                file_get_contents($image->getPathname()),
                $image->getClientOriginalName()
            )->post($fastapiUrl);

            return $this->dataResponse(new InsectDetectionResource($response->json()), '', $response->status());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 'Internal Error', 500);
        }
    }


    public function cropYield(Request $request)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'crop_type'           => 'required|string',
            'days_to_harvest'     => 'required|integer|min:1|max:365',
            'fertilizer_used'     => 'required|in:0,1',
            'irrigation_used'     => 'required|in:0,1',
            'rainfall_mm'         => 'required|numeric|min:0',
            'region'              => 'required|string',
            'soil_type'           => 'required|string',
            'temperature_celsius' => 'required|numeric',
            'weather_condition'   => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 'Validation Error', 422);
        }
        $fastapiUrl = env('FASTAPI_URL') . '/crop_yield';

        try {
            // 2. Send data to FastAPI server
            $response = Http::withHeaders([
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($fastapiUrl, [
                'crop_type'           => $request->crop_type,
                'days_to_harvest'     => (int) $request->days_to_harvest,
                'fertilizer_used'     => (int) $request->fertilizer_used,
                'irrigation_used'     => (int) $request->irrigation_used,
                'rainfall_mm'         => (float) $request->rainfall_mm,
                'region'              => $request->region,
                'soil_type'           => $request->soil_type,
                'temperature_celsius' => (float) $request->temperature_celsius,
                'weather_condition'   => $request->weather_condition,
            ]);

            // 3. Handle successful response
            if ($response->successful()) {
                return $this->dataResponse(
                    new CropYieldResource($response->json()),
                    'Data analyzed and crop yield prediction completed successfully.',
                    $response->status()
                );
            }

            // Handle server/FastAPI validation errors
            return $this->errorResponse('An error occurred within the AI prediction server.', 'FastAPI Error', $response->status());
        } catch (\Exception $e) {
            // Handle connection timeouts or server downtime
            return $this->errorResponse($e->getMessage(), 'Internal Error', 500);
        }
    }
}
