<?php

namespace App\Actions\Contracts;

use App\Models\Contract;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use App\Services\Media\MediaService;

class GenerateContractPdfAction
{
    public function execute(Contract $contract): Contract
    {
        return DB::transaction(function () use ($contract): Contract {
            $html = view('pdf.contract', compact('contract'))->render();

            $pdf = Pdf::loadHTML($html);
            $path = 'contracts/' . $contract->id . '_' . time() . '.pdf';

            app(MediaService::class)->disk()->put($path, $pdf->output());

            $contract->pdf_path = $path;
            $contract->save();

            return $contract;
        });
    }
}
