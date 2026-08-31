<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'adminId' => ['nullable', 'string'],
            'packageId' => ['nullable', 'string'],
            'name' => ['required', 'string', 'min:1', 'max:200'],
            'description' => ['required', 'string', 'min:1', 'max:2000'],
            'platforms' => ['required', 'array', 'min:1', 'max:20'],
            'platforms.*' => ['string', 'in:instagram,telegram,whatsapp,torob,digikala,linkedin'],
            'platformConfigs' => ['required', 'array', 'min:1'],
            'platformConfigs.*.platform' => ['string', 'in:instagram,telegram,whatsapp,torob,digikala,linkedin'],
            'platformConfigs.*.settings' => ['array'],
            'proposedPriceToman' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
            'proposedPriceUSD' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
            'billingCycle' => ['required', 'string', 'in:monthly,project,hourly'],
            'deliveryTime' => ['nullable', 'string', 'max:120'],
            'startDate' => ['nullable', 'string', 'max:120'],
            'endDate' => ['nullable', 'string', 'max:120'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
