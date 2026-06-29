<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('value', 12, 2)->nullable();
            $table->enum('status', ['draft', 'verification', 'documentation', 'approval', 'won', 'lost'])->default('draft');
            $table->foreignId('assigned_bdm_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('territory_id')->nullable()->constrained()->nullOnDelete();
            $table->string('verification_status')->nullable();
            $table->string('approval_status')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('lead_id');
            $table->index('assigned_bdm_id');
            $table->index('territory_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
