<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class MigrateHelper
{
    public static function legacy(string $table)
    {
        return DB::connection('legacy')->table($table);
    }

    /**
     * @return list<string>
     */
    public static function legacyColumns(string $table): array
    {
        return Schema::connection('legacy')->getColumnListing($table);
    }

    public static function guessMimeType(string $path): string
    {
        return match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',

            'pdf' => 'application/pdf',

            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv' => 'text/csv',

            'zip' => 'application/zip',
            'rar' => 'application/vnd.rar',

            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'ogg' => 'audio/ogg',
            'm4a' => 'audio/mp4',

            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'mkv' => 'video/x-matroska',

            default => 'application/octet-stream',
        };
    }

    public static function mapRole(?string $role): string
    {
        return match (strtolower(trim($role ?? ''))) {
            'lawyer_trainee' => 'lawyer_trainee',
            'senyor_legal_expert' => 'senior_legal_expert',
            'senior_legal_expert' => 'senior_legal_expert',
            'legal_expert' => 'legal_expert',
            'official_expert' => 'official_expert',
            'legal_doctorate' => 'legal_doctorate',
            'lawyer_bonyad' => 'lawyer_bonyad',
            'lawyer_judicial' => 'lawyer_judicial',
            'judge' => 'judge',
            'pro_user' => 'pro_user',
            'admin' => 'admin',
            default => 'user',
        };
    }

    public static function resetSequence(string $table): void
    {
        if (! preg_match('/^[a-z][a-z0-9_]*$/', $table)) {
            throw new InvalidArgumentException("Invalid table name: {$table}");
        }

        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        $sequence = DB::scalar("SELECT pg_get_serial_sequence('{$table}', 'id')");

        if ($sequence === null) {
            return;
        }

        $maxId = DB::table($table)->max('id');

        DB::statement(
            'SELECT setval(CAST(? AS regclass), ?, ?)',
            [$sequence, $maxId ?? 1, $maxId !== null]
        );
    }
}
