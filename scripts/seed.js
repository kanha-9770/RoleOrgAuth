const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create default organization
  const organization = await prisma.organization.upsert({
    where: { id: "org_default" },
    update: {},
    create: {
      id: "org_default",
      name: "Default Organization",
    },
  })

  console.log("✅ Created default organization")

  // Create default permissions
  const permissions = [
    // Read Permissions
    {
      id: "perm_read_users",
      name: "View Users",
      description: "View user profiles and basic information",
      category: "READ",
      resource: "users",
    },
    {
      id: "perm_read_roles",
      name: "View Roles",
      description: "View role definitions and hierarchy",
      category: "READ",
      resource: "roles",
    },
    {
      id: "perm_read_units",
      name: "View Units",
      description: "View organizational units",
      category: "READ",
      resource: "units",
    },
    {
      id: "perm_read_reports",
      name: "View Reports",
      description: "Access and view reports",
      category: "READ",
      resource: "reports",
    },
    {
      id: "perm_read_analytics",
      name: "View Analytics",
      description: "Access analytics and dashboards",
      category: "READ",
      resource: "analytics",
    },

    // Write Permissions
    {
      id: "perm_write_users",
      name: "Manage Users",
      description: "Create, edit, and manage user accounts",
      category: "WRITE",
      resource: "users",
    },
    {
      id: "perm_write_roles",
      name: "Manage Roles",
      description: "Create and modify roles",
      category: "WRITE",
      resource: "roles",
    },
    {
      id: "perm_write_units",
      name: "Manage Units",
      description: "Create and modify organizational units",
      category: "WRITE",
      resource: "units",
    },
    {
      id: "perm_write_reports",
      name: "Create Reports",
      description: "Create and modify reports",
      category: "WRITE",
      resource: "reports",
    },

    // Delete Permissions
    {
      id: "perm_delete_users",
      name: "Delete Users",
      description: "Remove user accounts",
      category: "DELETE",
      resource: "users",
    },
    {
      id: "perm_delete_roles",
      name: "Delete Roles",
      description: "Remove roles from system",
      category: "DELETE",
      resource: "roles",
    },
    {
      id: "perm_delete_units",
      name: "Delete Units",
      description: "Remove organizational units",
      category: "DELETE",
      resource: "units",
    },

    // Admin Permissions
    {
      id: "perm_admin_system",
      name: "System Administration",
      description: "Full system administration access",
      category: "ADMIN",
      resource: "system",
    },
    {
      id: "perm_admin_security",
      name: "Security Administration",
      description: "Manage security settings and policies",
      category: "ADMIN",
      resource: "security",
    },
    {
      id: "perm_admin_audit",
      name: "Audit Management",
      description: "Access audit logs and compliance features",
      category: "ADMIN",
      resource: "audit",
    },

    // Special Permissions
    {
      id: "perm_special_export",
      name: "Data Export",
      description: "Export data from the system",
      category: "SPECIAL",
      resource: "data",
    },
    {
      id: "perm_special_import",
      name: "Data Import",
      description: "Import data into the system",
      category: "SPECIAL",
      resource: "data",
    },
    {
      id: "perm_special_backup",
      name: "Backup Management",
      description: "Create and manage system backups",
      category: "SPECIAL",
      resource: "system",
    },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      update: {},
      create: {
        ...permission,
        organizationId: organization.id,
      },
    })
  }

  console.log("✅ Created default permissions")

  // Create sample users
  const sampleUsers = [
    {
      id: "user-1",
      email: "john.smith@company.com",
      first_name: "John",
      last_name: "Smith",
      department: "Finance",
      status: "ACTIVE",
      organizationId: organization.id,
    },
    {
      id: "user-2",
      email: "sarah.johnson@company.com",
      first_name: "Sarah",
      last_name: "Johnson",
      department: "Engineering",
      status: "ACTIVE",
      organizationId: organization.id,
    },
    {
      id: "user-3",
      email: "mike.chen@company.com",
      first_name: "Mike",
      last_name: "Chen",
      department: "Marketing",
      status: "ACTIVE",
      organizationId: organization.id,
    },
    {
      id: "user-4",
      email: "emily.davis@company.com",
      first_name: "Emily",
      last_name: "Davis",
      department: "HR",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  ]

  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    })
  }

  console.log("✅ Created sample users")

  console.log("🎉 Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
