<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:200'],
            'description' => ['required', 'string', 'min:1', 'max:2000'],
            'type' => ['required', 'string', 'in:platform,bundle'],
            'platforms' => ['required', 'array', 'min:1', 'max:20'],
            'platforms.*' => ['string', 'in:instagram,telegram,whatsapp,torob,digikala,linkedin'],
            'platformConfigs' => ['required', 'array', 'min:1'],
            'platformConfigs.*.platform' => ['string', 'in:instagram,telegram,whatsapp,torob,digikala,linkedin'],
            'platformConfigs.*.settings' => ['array'],
            'priceToman' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'priceUSD' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'billingCycle' => ['required', 'string', 'in:monthly,project,hourly'],
            'deliveryTime' => ['required', 'string', 'min:1', 'max:120'],
            'featured' => ['boolean'],
            'active' => ['boolean'],
        ];
    }
}
