<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('deal_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('partner_type', ['bdm', 'seller', 'service_person']);
            $table->string('business_name');
            $table->text('business_address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('locality_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('territory_id')->nullable()->constrained()->nullOnDelete();
            $table->string('contact_name');
            $table->string('contact_email')->nullable();
            $table->string('contact_mobile');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamp('onboarded_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('partner_type');
            $table->index('status');
            $table->index('territory_id');
            $table->index('locality_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
