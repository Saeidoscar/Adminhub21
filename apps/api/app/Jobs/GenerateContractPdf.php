<?php

namespace App\Jobs;

use App\Models\Contract;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GenerateContractPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 300;

    public function __construct(
        private readonly int $contractId
    ) {
        $this->onQueue('pdf-default');
    }

    public function handle(): void
    {
        $contract = Contract::with(['user', 'client', 'package'])->findOrFail($this->contractId);

        $pdf = Pdf::loadView('pdf.contract', [
            'contract' => $contract,
            'clauses' => $contract->clauses,
        ]);

        $filename = "contracts/contract_{$contract->id}.pdf";
        Storage::disk('local')->put($filename, $pdf->output());

        $contract->update(['pdf_path' => $filename]);

        Log::info('Contract PDF generated', [
            'contract_id' => $contract->id,
            'path' => $filename,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Contract PDF generation failed', [
            'contract_id' => $this->contractId,
            'error' => $exception->getMessage(),
        ]);
    }
}
