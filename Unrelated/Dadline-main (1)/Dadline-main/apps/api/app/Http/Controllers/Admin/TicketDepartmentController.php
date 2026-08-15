<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tickets\UpdateTicketDepartmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\UpdateTicketDepartmentRequest;
use App\Http\Resources\Tickets\TicketDepartmentResource;
use App\Models\TicketDepartment;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketDepartmentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return TicketDepartmentResource::collection(
            TicketDepartment::query()
                ->with('supporters:id,first_name,last_name,mobile,role')
                ->orderBy('sort_order')
                ->get()
        );
    }

    public function update(
        UpdateTicketDepartmentRequest $request,
        TicketDepartment $department,
        UpdateTicketDepartmentAction $action,
    ): TicketDepartmentResource {
        return new TicketDepartmentResource(
            $action->execute($department, $request->validated())
        );
    }
}
