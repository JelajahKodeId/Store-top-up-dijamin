<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        Role::updateOrCreate(['name' => 'admin']);
        Role::updateOrCreate(['name' => 'reseller']);
        Role::updateOrCreate(['name' => 'member']);

        // Define Permissions (Example)
        $permissions = [
            'manage-users',
            'manage-games',
            'manage-orders',
            'view-transactions',
            'topup-balance',
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['name' => $permission]);
        }

        // Assign all permissions to admin
        Role::findByName('admin')->givePermissionTo(Permission::all());
        
        // Example: Reseller can topup and view transactions
        Role::findByName('reseller')->givePermissionTo(['view-transactions']);
        
        // Member usually just buys
        Role::findByName('member')->givePermissionTo(['view-transactions']);
    }
}
