<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class CountryController extends Controller
{
    /**
     * Fetch countries from datacountry.io, cache them, and normalize the dialing codes.
     */
    public function index(): JsonResponse
    {
        $countries = Cache::remember('api_countries_list', 86400, function () {
            $apiKey = env('DATA_COUNTRY_API_KEY');
            if (empty($apiKey)) {
                return [];
            }

            try {
                $allData = [];
                $page = 1;
                $hasMore = true;

                while ($hasMore && $page <= 3) { // limit to 3 pages (300 countries) for safety
                    $response = Http::withToken($apiKey)
                        ->timeout(10)
                        ->get('https://api.datacountry.io/v1/countries', [
                            'limit' => 100,
                            'page' => $page,
                        ]);

                    if (! $response->successful()) {
                        break;
                    }

                    $data = $response->json('data', []);
                    $allData = array_merge($allData, $data);

                    $meta = $response->json('meta', []);
                    $hasMore = !empty($meta['hasNext']);
                    $page++;
                }

                if (empty($allData)) {
                    return [];
                }
                
                $data = $allData;
                
                // Manual overrides for known broken dial codes in the API
                $dialCodeOverrides = [
                    'ID' => '+62',
                    'MY' => '+60',
                    'SG' => '+65',
                    'PH' => '+63',
                    'TH' => '+66',
                    'VN' => '+84',
                    'BR' => '+55',
                    'US' => '+1',
                    'GB' => '+44',
                ];

                $formatted = [];
                foreach ($data as $country) {
                    $cca2 = $country['cca2'] ?? '';
                    $name = $country['name']['common'] ?? '';
                    $flag = $country['flag'] ?? '';
                    
                    $callingCode = $country['callingCode'] ?? '';
                    if (isset($dialCodeOverrides[$cca2])) {
                        $callingCode = $dialCodeOverrides[$cca2];
                    } elseif ($callingCode !== '') {
                        $callingCode = '+' . $callingCode;
                    }

                    if ($cca2 && $name) {
                        $formatted[] = [
                            'code' => $cca2,
                            'name' => $name,
                            'flag' => $flag,
                            'dial_code' => $callingCode,
                        ];
                    }
                }

                // Sort alphabetically by name
                usort($formatted, fn($a, $b) => strcmp($a['name'], $b['name']));

                // Move Indonesia to the top if present
                $idIndex = array_search('ID', array_column($formatted, 'code'));
                if ($idIndex !== false) {
                    $id = $formatted[$idIndex];
                    unset($formatted[$idIndex]);
                    array_unshift($formatted, $id);
                }

                return $formatted;
            } catch (\Exception $e) {
                return [];
            }
        });

        return response()->json($countries);
    }
}
