-- Seed script for role management system
-- This script creates initial data for the role management system

-- Insert default permissions
INSERT INTO permissions (id, name, description, category, resource, organization_id, is_active, created_at, updated_at) VALUES
-- Read Permissions
('perm_read_users', 'View Users', 'View user profiles and basic information', 'READ', 'users', 'org_default', true, NOW(), NOW()),
('perm_read_roles', 'View Roles', 'View role definitions and hierarchy', 'READ', 'roles', 'org_default', true, NOW(), NOW()),
('perm_read_units', 'View Units', 'View organizational units', 'READ', 'units', 'org_default', true, NOW(), NOW()),
('perm_read_reports', 'View Reports', 'Access and view reports', 'READ', 'reports', 'org_default', true, NOW(), NOW()),
('perm_read_analytics', 'View Analytics', 'Access analytics and dashboards', 'READ', 'analytics', 'org_default', true, NOW(), NOW()),

-- Write Permissions
('perm_write_users', 'Manage Users', 'Create, edit, and manage user accounts', 'WRITE', 'users', 'org_default', true, NOW(), NOW()),
('perm_write_roles', 'Manage Roles', 'Create and modify roles', 'WRITE', 'roles', 'org_default', true, NOW(), NOW()),
('perm_write_units', 'Manage Units', 'Create and modify organizational units', 'WRITE', 'units', 'org_default', true, NOW(), NOW()),
('perm_write_reports', 'Create Reports', 'Create and modify reports', 'WRITE', 'reports', 'org_default', true, NOW(), NOW()),

-- Delete Permissions
('perm_delete_users', 'Delete Users', 'Remove user accounts', 'DELETE', 'users', 'org_default', true, NOW(), NOW()),
('perm_delete_roles', 'Delete Roles', 'Remove roles from system', 'DELETE', 'roles', 'org_default', true, NOW(), NOW()),
('perm_delete_units', 'Delete Units', 'Remove organizational units', 'DELETE', 'units', 'org_default', true, NOW(), NOW()),

-- Admin Permissions
('perm_admin_system', 'System Administration', 'Full system administration access', 'ADMIN', 'system', 'org_default', true, NOW(), NOW()),
('perm_admin_security', 'Security Administration', 'Manage security settings and policies', 'ADMIN', 'security', 'org_default', true, NOW(), NOW()),
('perm_admin_audit', 'Audit Management', 'Access audit logs and compliance features', 'ADMIN', 'audit', 'org_default', true, NOW(), NOW()),

-- Special Permissions
('perm_special_export', 'Data Export', 'Export data from the system', 'SPECIAL', 'data', 'org_default', true, NOW(), NOW()),
('perm_special_import', 'Data Import', 'Import data into the system', 'SPECIAL', 'data', 'org_default', true, NOW(), NOW()),
('perm_special_backup', 'Backup Management', 'Create and manage system backups', 'SPECIAL', 'system', 'org_default', true, NOW(), NOW());

-- Create default organization if it doesn't exist
INSERT INTO organizations (id, name, created_at, updated_at) VALUES
('org_default', 'Default Organization', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Note: The actual organizational units and roles will be created through the UI
-- as they are specific to each organization's structure
