<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'min:1', 'max:200'],
            'description' => ['nullable', 'string', 'min:1', 'max:2000'],
            'platformConfigs' => ['nullable', 'array', 'min:1'],
            'platformConfigs.*.platform' => ['string', 'in:instagram,telegram,whatsapp,torob,digikala,linkedin'],
            'platformConfigs.*.settings' => ['array'],
            'priceToman' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
            'priceUSD' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
            'billingCycle' => ['nullable', 'string', 'in:monthly,project,hourly'],
            'deliveryTime' => ['nullable', 'string', 'min:1', 'max:120'],
            'featured' => ['boolean'],
            'active' => ['boolean'],
        ];
    }
}
