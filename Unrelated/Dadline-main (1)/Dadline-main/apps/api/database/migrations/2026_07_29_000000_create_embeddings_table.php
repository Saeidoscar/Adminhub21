<?php

use App\Enums\EmbeddingSourceType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
        }

        Schema::create('embeddings', function (Blueprint $table): void {
            $table->id();
            $table->smallInteger('source_type');
            $table->text('source_id');
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['source_type', 'source_id'], 'idx_embeddings_source');
        });

        if (DB::getDriverName() === 'pgsql') {
            $sourceTypes = implode(', ', array_column(EmbeddingSourceType::cases(), 'value'));

            DB::statement('ALTER TABLE embeddings ADD COLUMN embedding vector(1024) NOT NULL');
            DB::statement("ALTER TABLE embeddings ADD CONSTRAINT embeddings_source_type_check CHECK (source_type IN ({$sourceTypes}))");
            DB::statement('CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw (embedding vector_cosine_ops)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('embeddings');
    }
};
