<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use App\Services\Cases\CaseService;
use App\Services\Schedule\ScheduleService;
use App\Models\OfficeCase;
use App\Models\Office;
use App\Models\OfficeCaseTask;
use App\Models\OfficeTimeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        private readonly CaseService $caseService,
        private readonly ScheduleService $scheduleService,
    ) {}

    public function events(Request $request): JsonResponse
    {
        $events = \App\Models\OfficeCaseEvent::query()
            ->whereHas('officeCase.office', function ($q) use ($request): void {
                $q->where('owner_id', $request->user()->id);
            })
            ->with(['officeCase'])
            ->get();

        return response()->json($events);
    }

    public function storeEvent(Request $request, OfficeCase $case): JsonResponse
    {
        $event = $this->scheduleService->createCalendarEvent($case, $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'event_at' => ['required', 'date'],
            'reminder_before' => ['nullable', 'integer', 'min:0'],
        ]));

        return response()->json($event, 201);
    }

    public function updateEvent(Request $request, $id): JsonResponse
    {
        $event = \App\Models\OfficeCaseEvent::query()->findOrFail($id);

        $event->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'event_at' => ['nullable', 'date'],
            'reminder_before' => ['nullable', 'integer', 'min:0'],
        ]));

        return response()->json($event);
    }

    public function deleteEvent($id): JsonResponse
    {
        $event = \App\Models\OfficeCaseEvent::query()->findOrFail($id);
        $event->delete();

        return response()->json(null, 204);
    }

    public function tasks(Request $request): JsonResponse
    {
        $tasks = OfficeCaseTask::query()
            ->whereHas('officeCase.office', function ($q) use ($request): void {
                $q->where('owner_id', $request->user()->id);
            })
            ->with(['officeCase', 'assignee'])
            ->paginate();

        return response()->json($tasks);
    }

    public function storeTask(Request $request, OfficeCase $case): JsonResponse
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

    public function updateTask(Request $request, $id): JsonResponse
    {
        $task = OfficeCaseTask::query()->findOrFail($id);

        $task->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:todo,in_progress,done,blocked'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'deadline' => ['nullable', 'date'],
        ]));

        return response()->json($task);
    }

    public function completeTask($id): JsonResponse
    {
        $task = OfficeCaseTask::query()->findOrFail($id);
        $task = $this->scheduleService->manageTaskQueue($task, 'completed');

        return response()->json($task);
    }

    public function logTime(Request $request): JsonResponse
    {
        $case = OfficeCase::query()->findOrFail($request->case_id);

        $log = $this->caseService->logTime($case, $request->user(), $request->validate([
            'duration' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]));

        return response()->json($log, 201);
    }

    public function timeLogs(Request $request): JsonResponse
    {
        $logs = OfficeTimeLog::query()
            ->whereHas('officeCase.office', function ($q) use ($request): void {
                $q->where('owner_id', $request->user()->id);
            })
            ->with(['officeCase', 'user'])
            ->paginate();

        return response()->json($logs);
    }
}


