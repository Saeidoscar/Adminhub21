<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Dadline API",
    version: "1.2.31",
    description: "Dadline API Documentation"
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
    // description: "Dadline API Server EndPoint"
)]
class ApiInfo
{
    //
}