<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('contact_name');
            $table->string('contact_email')->nullable();
            $table->string('contact_mobile');
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('locality_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('territory_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('division_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_bdm_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source')->nullable();
            $table->enum('status', ['new', 'assigned', 'qualified', 'deal_created', 'won', 'lost'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->text('notes')->nullable();
            $table->boolean('is_mapped')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('priority');
            $table->index('assigned_bdm_id');
            $table->index('territory_id');
            $table->index('locality_id');
            $table->index('contact_mobile');
            $table->index('contact_email');
            $table->index('is_mapped');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
