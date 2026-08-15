<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Cases\CaseService;
use App\Models\OfficeCase;
use App\Models\Office;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    public function __construct(
        private readonly CaseService $caseService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $cases = OfficeCase::query()
            ->whereHas('office', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->orWhereHas('office.members', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['office', 'tasks', 'events', 'notes', 'timeLogs', 'transactions', 'attachments'])
            ->paginate();

        return response()->json($cases);
    }

    public function store(Request $request): JsonResponse
    {
        $office = Office::query()->where('owner_id', $request->user()->id)->firstOrFail();

        $case = $this->caseService->createCase($office, $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'case_fee' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]));

        return response()->json($case, 201);
    }

    public function show(OfficeCase $case): JsonResponse
    {
        $case->load(['office', 'tasks', 'events', 'notes', 'timeLogs', 'transactions', 'attachments']);

        return response()->json($case);
    }

    public function update(Request $request, OfficeCase $case): JsonResponse
    {
        $case->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]));

        return response()->json($case->load(['office', 'tasks', 'events', 'notes', 'timeLogs', 'transactions', 'attachments']));
    }

    public function destroy(OfficeCase $case): JsonResponse
    {
        $case->delete();

        return response()->json(null, 204);
    }

    public function addTask(Request $request, OfficeCase $case): JsonResponse
    {
        $task = $this->caseService->assignTask($case, $request->user(), $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'deadline' => ['nullable', 'date'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'status' => ['nullable', 'string', 'in:todo,in_progress,done,blocked'],
        ]));

        return response()->json($task, 201);
    }

    public function updateTask(Request $request, OfficeCase $case, $taskId): JsonResponse
    {
        $task = $case->tasks()->findOrFail($taskId);

        $task->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:todo,in_progress,done,blocked'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'deadline' => ['nullable', 'date'],
        ]));

        return response()->json($task);
    }
}
