<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modify status enum to include 'pending'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE partners MODIFY COLUMN status ENUM('pending','active','inactive','suspended') DEFAULT 'active'");
        } elseif (DB::getDriverName() === 'sqlite') {
            // SQLite: drop index first, then drop and recreate the column to update CHECK constraint, then recreate index
            Schema::table('partners', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
            Schema::table('partners', function (Blueprint $table) {
                $table->dropColumn('status');
            });
            Schema::table('partners', function (Blueprint $table) {
                $table->enum('status', ['pending', 'active', 'inactive', 'suspended'])->default('active')->after('contact_mobile');
                $table->index('status');
            });
        }

        Schema::table('partners', function (Blueprint $table) {
            // 2. BDM-specific columns
            $table->tinyInteger('experience_years')->nullable()->after('onboarded_at');
            $table->string('previous_employer', 255)->nullable()->after('experience_years');
            $table->text('experience_description')->nullable()->after('previous_employer');
            $table->string('education_level', 100)->nullable()->after('experience_description');
            $table->string('education_institution', 255)->nullable()->after('education_level');
            $table->string('education_field', 255)->nullable()->after('education_institution');
            $table->json('preferred_territory_ids')->nullable()->after('education_field');

            // 3. Seller-specific columns
            $table->string('gst_number', 20)->nullable()->after('preferred_territory_ids');
            $table->string('business_type', 100)->nullable()->after('gst_number');
            $table->string('annual_turnover', 50)->nullable()->after('business_type');
            $table->json('product_categories')->nullable()->after('annual_turnover');

            // 4. Service Person-specific columns
            $table->json('services_offered')->nullable()->after('product_categories');
            $table->boolean('has_driving_license')->default(false)->after('services_offered');
            $table->string('driving_license_number', 50)->nullable()->after('has_driving_license');
            $table->string('license_type', 30)->nullable()->after('driving_license_number');
            $table->string('vehicle_type', 50)->nullable()->after('license_type');
            $table->string('vehicle_registration', 30)->nullable()->after('vehicle_type');

            // 5. Common columns
            $table->dateTime('appointment_datetime')->nullable()->after('vehicle_registration');
            $table->text('appointment_notes')->nullable()->after('appointment_datetime');
            $table->string('registration_source', 30)->nullable()->default('admin')->after('appointment_notes');
            $table->string('utm_source', 100)->nullable()->after('registration_source');
            $table->string('utm_medium', 100)->nullable()->after('utm_source');
            $table->string('utm_campaign', 100)->nullable()->after('utm_medium');

            // 6. Indexes
            $table->index('registration_source');
            $table->index('appointment_datetime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['registration_source']);
            $table->dropIndex(['appointment_datetime']);

            // Drop all added columns
            $table->dropColumn([
                // BDM-specific
                'experience_years',
                'previous_employer',
                'experience_description',
                'education_level',
                'education_institution',
                'education_field',
                'preferred_territory_ids',
                // Seller-specific
                'gst_number',
                'business_type',
                'annual_turnover',
                'product_categories',
                // Service Person-specific
                'services_offered',
                'has_driving_license',
                'driving_license_number',
                'license_type',
                'vehicle_type',
                'vehicle_registration',
                // Common
                'appointment_datetime',
                'appointment_notes',
                'registration_source',
                'utm_source',
                'utm_medium',
                'utm_campaign',
            ]);
        });

        // Revert status enum
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE partners MODIFY COLUMN status ENUM('active','inactive','suspended') DEFAULT 'active'");
        } elseif (DB::getDriverName() === 'sqlite') {
            Schema::table('partners', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
            Schema::table('partners', function (Blueprint $table) {
                $table->dropColumn('status');
            });
            Schema::table('partners', function (Blueprint $table) {
                $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('contact_mobile');
                $table->index('status');
            });
        }
    }
};
