<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiTrait;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Routing\Loader\Configurator\Traits\AddTrait;

class ChatBotController extends Controller
{
    use ApiTrait;
    public function request(Request $request)
    {
        $request->validate([
            'promet' => [
                'required',
                'string',
                'min:3',
                'max:5000',
            ],
        ]);

        $apiKey = env('GEMINI_API_KEY');


        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" . $apiKey;

        $response = Http::withoutVerifying()
            ->timeout(60)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $request->promet]
                        ]
                    ]
                ]
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $result = $data['candidates'][0]['content']['parts'][0]['text'];

            return $this->dataResponse(['response' => $result]);
        }


        return $this->errorResponse(['limits' => 'You have upgrade']);;
    }
}
