<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions by module
        $permissions = [
            // Division
            'divisions.view', 'divisions.create', 'divisions.update', 'divisions.delete',
            // Territory
            'territories.view', 'territories.create', 'territories.update', 'territories.delete',
            // Locality
            'localities.view', 'localities.create', 'localities.update', 'localities.delete',
            // Lead
            'leads.view', 'leads.create', 'leads.update', 'leads.delete', 'leads.assign',
            // Deal
            'deals.view', 'deals.create', 'deals.update', 'deals.delete', 'deals.approve',
            // Partner
            'partners.view', 'partners.create', 'partners.update', 'partners.delete', 'partners.convert',
            // Dashboard
            'dashboard.view',
            // Reports
            'reports.view', 'reports.export',
            // Notifications
            'notifications.view', 'notifications.manage',
            // Users
            'users.view', 'users.create', 'users.update', 'users.delete',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $admin->syncPermissions($permissions);

        $bdm = Role::firstOrCreate(['name' => 'BDM', 'guard_name' => 'web']);
        $bdm->syncPermissions([
            'divisions.view',
            'territories.view',
            'localities.view',
            'leads.view', 'leads.create', 'leads.update',
            'deals.view', 'deals.create', 'deals.update',
            'partners.view',
            'dashboard.view',
            'reports.view',
            'notifications.view',
        ]);

        $seller = Role::firstOrCreate(['name' => 'Seller', 'guard_name' => 'web']);
        $seller->syncPermissions([
            'partners.view', 'partners.update',
            'dashboard.view',
            'notifications.view',
        ]);

        $servicePerson = Role::firstOrCreate(['name' => 'Service Person', 'guard_name' => 'web']);
        $servicePerson->syncPermissions([
            'partners.view', 'partners.update',
            'dashboard.view',
            'notifications.view',
        ]);
    }
}
