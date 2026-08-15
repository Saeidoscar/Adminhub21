<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        }

        Schema::create('offices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('name');
            $table->string('status', 20)->default('active');
            $table->jsonb('holiday')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['owner_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('office_members', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('office_id')
                ->constrained('offices')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('role', 30)->default('secretary');
            $table->boolean('can_access')->default(true);
            $table->jsonb('permissions')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['office_id', 'user_id']);
            $table->index(['user_id', 'can_access']);
            $table->index(['office_id', 'role']);
        });

        Schema::create('office_claim_types', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('office_claim_types')
                ->nullOnDelete();
            $table->string('category', 30);
            $table->string('name');
            $table->boolean('is_leaf')->default(false);

            $table->index('parent_id');
            $table->index(['category', 'is_leaf']);
        });

        Schema::create('office_request_types', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->index(['is_active', 'sort_order']);
        });

        DB::table('office_request_types')->insert([
            ['code' => 'initial_petition', 'name' => 'دادخواست بدوی', 'sort_order' => 10],
            ['code' => 'criminal_complaint', 'name' => 'شکواییه', 'sort_order' => 20],
            ['code' => 'criminal_retrial', 'name' => 'اعاده دادرسی کیفری', 'sort_order' => 30],
            ['code' => 'civil_retrial', 'name' => 'اعاده دادرسی مدنی', 'sort_order' => 40],
            ['code' => 'appeal', 'name' => 'تجدیدنظرخواهی', 'sort_order' => 50],
            ['code' => 'order_objection', 'name' => 'اعتراض به قرار', 'sort_order' => 60],
            ['code' => 'third_party_objection', 'name' => 'اعتراض ثالث', 'sort_order' => 70],
            ['code' => 'counterclaim', 'name' => 'تقابل', 'sort_order' => 80],
            ['code' => 'third_party_joinder', 'name' => 'جلب ثالث', 'sort_order' => 90],
            ['code' => 'third_party_intervention', 'name' => 'ورود ثالث', 'sort_order' => 100],
            ['code' => 'default_judgment_objection', 'name' => 'واخواهی', 'sort_order' => 110],
            ['code' => 'other', 'name' => 'سایر', 'sort_order' => 120],
        ]);

        Schema::create('office_contacts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('office_id')
                ->constrained('offices')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('full_name');
            $table->string('national_id', 11)->nullable();
            $table->string('mobile', 11)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('organization')->nullable();
            $table->string('address')->nullable();
            $table->string('father_name', 55)->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->unique(['office_id', 'national_id']);
            $table->index('office_id');
            $table->index('user_id');
            $table->index(['office_id', 'mobile']);
        });

        Schema::create('office_cases', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('office_id')
                ->constrained('offices')
                ->cascadeOnDelete();
            $table->string('case_number')->nullable();
            $table->string('archive_number')->nullable();
            $table->string('title');
            $table->foreignId('request_type_id')
                ->nullable()
                ->constrained('office_request_types')
                ->nullOnDelete();
            $table->foreignId('claim_type_id')
                ->nullable()
                ->constrained('office_claim_types')
                ->nullOnDelete();
            $table->foreignId('authority_id')
                ->nullable()
                ->after('claim_type_id')
                ->constrained('office_referral_authorities')
                ->nullOnDelete();
            $table->index('authority_id');
            $table->string('case_branch')->nullable();
            $table->foreignId('city_id')
                ->nullable()
                ->constrained('cities')
                ->nullOnDelete();
            $table->foreignId('subscription_id')
                ->nullable()
                ->constrained('consultation_subscriptions')
                ->nullOnDelete();
            $table->string('status', 30)->default('intake');
            $table->unsignedBigInteger('case_fee')
                ->nullable();
            $table->text('description')->nullable();
            $table->smallInteger('progress')->default(0);
            $table->timestampTz('archived_at')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['office_id', 'status']);
            $table->index(['office_id', 'archived_at']);
            $table->index(['office_id', 'case_number']);
            $table->index(['office_id', 'archive_number']);
            $table->index('request_type_id');
            $table->index('claim_type_id');
            $table->index('city_id');
            $table->index('subscription_id');
        });

        Schema::create('office_case_parties', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('case_id')
                ->constrained('office_cases')
                ->cascadeOnDelete();
            $table->foreignId('contact_id')
                ->nullable()
                ->constrained('office_contacts')
                ->nullOnDelete();
            $table->string('role', 100);
            $table->boolean('is_client')->default(false);
            $table->timestampTz('created_at')->useCurrent();

            $table->index('case_id');
            $table->index('contact_id');
            $table->index(['case_id', 'is_client']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE offices ADD CONSTRAINT offices_status_check CHECK (status IN ('active', 'deprived', 'disabled'))");
            DB::statement("ALTER TABLE office_members ADD CONSTRAINT office_members_role_check CHECK (role IN ('owner', 'partner', 'associate', 'secretary'))");
            DB::statement("ALTER TABLE office_claim_types ADD CONSTRAINT office_claim_types_category_check CHECK (category IN ('حقوقی', 'کیفری', 'اداری'))");
            DB::statement('CREATE INDEX office_contacts_full_name_trgm_index ON office_contacts USING gin (full_name gin_trgm_ops)');
            DB::statement('CREATE INDEX office_cases_title_trgm_index ON office_cases USING gin (title gin_trgm_ops)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('office_case_parties');
        Schema::dropIfExists('office_cases');
        Schema::dropIfExists('office_contacts');
        Schema::dropIfExists('office_request_types');
        Schema::dropIfExists('office_claim_types');
        Schema::dropIfExists('office_members');
        Schema::dropIfExists('offices');
    }
};
