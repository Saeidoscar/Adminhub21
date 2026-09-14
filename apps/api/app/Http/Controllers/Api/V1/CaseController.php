<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\OfficeCase;
use App\Services\Cases\CaseService;
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
        $this->authorize('view', $case);
        $case->load(['office', 'tasks', 'events', 'notes', 'timeLogs', 'transactions', 'attachments']);

        return response()->json($case);
    }

    public function update(Request $request, OfficeCase $case): JsonResponse
    {
        $this->authorize('update', $case);
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
        $this->authorize('update', $case);
        $case->delete();

        return response()->json(null, 204);
    }

    public function addTask(Request $request, OfficeCase $case): JsonResponse
    {
        $this->authorize('update', $case);
        $task = $this->caseService->assignTask($case, $request->user(), $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'deadline' => ['nullable', 'date'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'status' => ['nullable', 'string', 'in:todo,in_progress,done,blocked'],
        ]));

        return response()->json($task, 201);
    }

    public function updateTask(Request $request, OfficeCase $case): JsonResponse
    {
        $task = $case->tasks()->findOrFail($request->route('taskId'));

        $this->authorize('update', $case);
        $task->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:todo,in_progress,done,blocked'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'deadline' => ['nullable', 'date'],
        ]));

        return response()->json($task);
    }

    public function addEvent(Request $request, OfficeCase $case): JsonResponse
    {
        $this->authorize('update', $case);
        $event = $this->caseService->addEvent($case, $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'event_at' => ['required', 'date'],
            'reminder_before' => ['nullable', 'integer', 'min:0'],
            'reminder_sent' => ['nullable', 'boolean'],
        ]));

        return response()->json($event, 201);
    }

    public function updateEvent(Request $request, OfficeCase $case): JsonResponse
    {
        $event = $case->events()->findOrFail($request->route('eventId'));
        $this->authorize('update', $case);
        $event = $this->caseService->updateEvent($event, $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'event_at' => ['nullable', 'date'],
            'reminder_before' => ['nullable', 'integer', 'min:0'],
            'reminder_sent' => ['nullable', 'boolean'],
        ]));

        return response()->json($event);
    }

    public function destroyEvent(Request $request, OfficeCase $case): JsonResponse
    {
        $event = $case->events()->findOrFail($request->route('eventId'));
        $this->authorize('update', $case);
        $this->caseService->destroyEvent($event);

        return response()->json(null, 204);
    }

    public function addTimeLog(Request $request, OfficeCase $case): JsonResponse
    {
        $this->authorize('update', $case);
        $log = $this->caseService->logTime($case, $request->user(), $request->validate([
            'duration' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]));

        return response()->json($log, 201);
    }

    public function updateTimeLog(Request $request, OfficeCase $case): JsonResponse
    {
        $log = $case->timeLogs()->findOrFail($request->route('logId'));
        $this->authorize('update', $case);
        $log = $this->caseService->updateTimeLog($log, $request->validate([
            'duration' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]));

        return response()->json($log);
    }

    public function destroyTimeLog(Request $request, OfficeCase $case): JsonResponse
    {
        $log = $case->timeLogs()->findOrFail($request->route('logId'));
        $this->authorize('update', $case);
        $this->caseService->destroyTimeLog($log);

        return response()->json(null, 204);
    }
}
