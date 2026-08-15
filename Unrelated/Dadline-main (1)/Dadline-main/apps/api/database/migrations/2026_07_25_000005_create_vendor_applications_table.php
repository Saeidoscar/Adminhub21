<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('target_role', 30);
            $table->unsignedBigInteger('price');
            $table->text('message')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('user_id');
            $table->index(['status', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE vendor_applications ADD CONSTRAINT vendor_applications_target_role_check CHECK (target_role IN ('lawyer_bonyad', 'lawyer_judicial', 'judge', 'official_expert', 'legal_expert', 'senior_legal_expert', 'legal_doctorate', 'lawyer_trainee'))");
            DB::statement("ALTER TABLE vendor_applications ADD CONSTRAINT vendor_applications_status_check CHECK (status IN ('draft', 'pending', 'accepted', 'rejected'))");
            DB::statement('ALTER TABLE vendor_applications ADD CONSTRAINT vendor_applications_price_check CHECK (price >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_applications');
    }
};
