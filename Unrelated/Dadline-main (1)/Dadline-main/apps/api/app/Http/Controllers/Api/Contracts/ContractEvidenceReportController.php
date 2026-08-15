<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\GenerateContractEvidenceReportAction;
use App\Enums\ContractEvidenceReportAudience;
use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContractEvidenceReportController extends Controller
{
    public function __invoke(
        Request $request,
        Contract $contract,
        GenerateContractEvidenceReportAction $action
    ): Response {
        $validated = $request->validate([
            'audience' => ['sometimes', 'string', 'in:user,judicial'],
        ]);
        $audience = ContractEvidenceReportAudience::from($validated['audience'] ?? ContractEvidenceReportAudience::User->value);
        $user = $request->user();

        abort_unless($user !== null, 401);
        $this->authorize('downloadEvidence', $contract);
        abort_unless($audience !== ContractEvidenceReportAudience::Judicial || $user->isAdmin(), 403, 'شما اجازه دریافت این گزارش را ندارید.');

        $report = $request->boolean('download')
            ? $action->execute($contract, $audience, $user)
            : $action->render($contract, $audience, $user);

        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return response($report['content'], 200, [
            'Content-Type' => $report['mime_type'],
            'Content-Length' => (string) $report['size_bytes'],
            'Content-Disposition' => $disposition.'; filename="'.$report['filename'].'"',
        ]);
    }
}
