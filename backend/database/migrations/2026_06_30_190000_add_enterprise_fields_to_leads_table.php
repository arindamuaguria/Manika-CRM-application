<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Business Information
            $table->string('company_name')->nullable()->after('contact_mobile');
            $table->string('industry')->nullable()->after('company_name');
            $table->string('company_size')->nullable()->after('industry');
            $table->string('website')->nullable()->after('company_size');

            // Personal Information
            $table->string('job_title')->nullable()->after('contact_name');
            $table->string('alternate_mobile')->nullable()->after('contact_mobile');
            $table->string('linkedin_url')->nullable()->after('website');

            // Lead Metrics & Campaign Context
            $table->decimal('estimated_deal_value', 12, 2)->nullable()->after('priority');
            $table->string('preferred_contact_method')->nullable()->after('estimated_deal_value');
            $table->string('utm_source')->nullable()->after('source');
            $table->string('utm_medium')->nullable()->after('utm_source');
            $table->string('utm_campaign')->nullable()->after('utm_medium');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'industry',
                'company_size',
                'website',
                'job_title',
                'alternate_mobile',
                'linkedin_url',
                'estimated_deal_value',
                'preferred_contact_method',
                'utm_source',
                'utm_medium',
                'utm_campaign',
            ]);
        });
    }
};
