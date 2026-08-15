<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {

            $table->id();

            // Login
            $table->string('mobile', 11)->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password')->nullable();
            $table->rememberToken();

            // Basic Profile
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');

            // Access
            $table->string('role', 30)->default('user');
            $table->boolean('is_vendor')->default(false);

            $table->timestampTz('registered_at')->nullable();
            $table->timestampTz('last_login_at')->nullable();

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('role');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
                ALTER TABLE users
                ADD CONSTRAINT users_role_check
                CHECK (
                    role IN (
                        'user',
                        'lawyer_bonyad',
                        'lawyer_judicial',
                        'judge',
                        'official_expert',
                        'legal_expert',
                        'senior_legal_expert',
                        'legal_doctorate',
                        'lawyer_trainee',
                        'admin',
                        'manager',
                        'editor'
                    )
                );
            ");
        }

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('mobile')->primary();
            $table->string('token');
            $table->timestampTz('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->longText('payload');

            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
