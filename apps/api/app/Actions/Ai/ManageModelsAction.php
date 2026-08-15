<?php

namespace App\Actions\Ai;

use App\Models\AiModel;
use Illuminate\Support\Facades\DB;

class ManageModelsAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(?AiModel $model, array $data): AiModel
    {
        return DB::transaction(function () use ($model, $data): AiModel {
            $model ??= new AiModel($data);
            $model->fill($data);
            $model->save();

            return $model;
        });
    }
}
