<?php

namespace App\Actions\Contracts;

use App\Models\Contract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateContractPdfAction
{
    public function execute(Contract $contract): Contract
    {
        return DB::transaction(function () use ($contract): Contract {
            $html = view('pdf.contract', compact('contract'))->render();

            $pdf = Pdf::loadHTML($html);
            $path = 'contracts/' . $contract->id . '_' . time() . '.pdf';

            Storage::disk('public')->put($path, $pdf->output());

            $contract->pdf_path = $path;
            $contract->save();

            return $contract;
        });
    }
}
