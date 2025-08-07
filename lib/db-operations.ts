import { prisma } from "./prisma"
import type { RoleFormData, OrganizationUnitFormData } from "@/types/role"

// Organization Unit Operations
export async function createOrganizationUnit(
  organizationId: string,
  unitData: OrganizationUnitFormData,
  parentId?: string,
) {
  const parentUnit = parentId
    ? await prisma.organizationUnit.findUnique({
        where: { id: parentId },
      })
    : null

  const unit = await prisma.organizationUnit.create({
    data: {
      name: unitData.name,
      description: unitData.description,
      organizationId,
      parentId,
      level: parentUnit ? parentUnit.level + 1 : 0,
    },
    include: {
      children: true,
      unitRoles: {
        include: {
          role: true,
        },
      },
      userAssignments: {
        include: {
          user: true,
          role: true,
        },
      },
    },
  })

  // Assign roles to unit if provided
  if (unitData.assignedRoles && unitData.assignedRoles.length > 0) {
    await Promise.all(
      unitData.assignedRoles.map((roleId) =>
        prisma.unitRoleAssignment.create({
          data: {
            unitId: unit.id,
            roleId,
          },
        }),
      ),
    )
  }

  // Assign users to unit if provided
  if (unitData.assignedUsers && unitData.assignedUsers.length > 0) {
    await Promise.all(
      unitData.assignedUsers.map((assignment) =>
        prisma.userUnitAssignment.create({
          data: {
            userId: assignment.userId,
            unitId: unit.id,
            roleId: assignment.roleId,
          },
        }),
      ),
    )
  }

  return unit
}

export async function updateOrganizationUnit(unitId: string, unitData: Partial<OrganizationUnitFormData>) {
  return await prisma.organizationUnit.update({
    where: { id: unitId },
    data: {
      name: unitData.name,
      description: unitData.description,
    },
    include: {
      children: true,
      unitRoles: {
        include: {
          role: true,
        },
      },
      userAssignments: {
        include: {
          user: true,
          role: true,
        },
      },
    },
  })
}

export async function deleteOrganizationUnit(unitId: string) {
  // Delete all child units recursively
  const childUnits = await prisma.organizationUnit.findMany({
    where: { parentId: unitId },
  })

  for (const child of childUnits) {
    await deleteOrganizationUnit(child.id)
  }

  // Delete the unit
  return await prisma.organizationUnit.delete({
    where: { id: unitId },
  })
}

export async function getOrganizationUnits(organizationId: string) {
  return await prisma.organizationUnit.findMany({
    where: {
      organizationId,
      parentId: null, // Get root units only
    },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true,
                },
              },
            },
          },
        },
      },
      unitRoles: {
        include: {
          role: true,
        },
      },
      userAssignments: {
        include: {
          user: true,
          role: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  })
}

// Role Operations
export async function createRole(organizationId: string, roleData: RoleFormData, parentId?: string) {
  const parentRole = parentId
    ? await prisma.role.findUnique({
        where: { id: parentId },
      })
    : null

  return await prisma.role.create({
    data: {
      name: roleData.name,
      description: roleData.description,
      shareDataWithPeers: roleData.shareDataWithPeers,
      organizationId,
      parentId,
      level: parentRole ? parentRole.level + 1 : 0,
    },
    include: {
      children: true,
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })
}

export async function updateRole(roleId: string, roleData: Partial<RoleFormData>) {
  return await prisma.role.update({
    where: { id: roleId },
    data: {
      name: roleData.name,
      description: roleData.description,
      shareDataWithPeers: roleData.shareDataWithPeers,
    },
    include: {
      children: true,
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })
}

export async function deleteRole(roleId: string) {
  // Delete all child roles recursively
  const childRoles = await prisma.role.findMany({
    where: { parentId: roleId },
  })

  for (const child of childRoles) {
    await deleteRole(child.id)
  }

  // Delete the role
  return await prisma.role.delete({
    where: { id: roleId },
  })
}

export async function getRoles(organizationId: string) {
  return await prisma.role.findMany({
    where: {
      organizationId,
      parentId: null, // Get root roles only
    },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true,
                },
              },
            },
          },
        },
      },
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  })
}

// User Assignment Operations
export async function assignUserToUnit(userId: string, unitId: string, roleId: string, notes?: string) {
  return await prisma.userUnitAssignment.upsert({
    where: {
      userId_unitId: {
        userId,
        unitId,
      },
    },
    update: {
      roleId,
      notes,
    },
    create: {
      userId,
      unitId,
      roleId,
      notes,
    },
  })
}

export async function removeUserFromUnit(userId: string, unitId: string) {
  return await prisma.userUnitAssignment.delete({
    where: {
      userId_unitId: {
        userId,
        unitId,
      },
    },
  })
}

// Permission Operations
export async function assignPermissionToRole(roleId: string, permissionId: string, canDelegate = false) {
  return await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
    update: {
      granted: true,
      canDelegate,
    },
    create: {
      roleId,
      permissionId,
      granted: true,
      canDelegate,
    },
  })
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  return await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  })
}

// Data Sharing Operations
export async function createDataSharingRule(
  organizationId: string,
  ruleData: {
    name: string
    description?: string
    sourceUnitId: string
    targetUnitId: string
    dataTypes: string[]
    accessLevel: "READ" | "WRITE" | "FULL"
    conditions: string[]
    isActive: boolean
  },
) {
  return await prisma.dataSharingRule.create({
    data: {
      ...ruleData,
      organizationId,
    },
    include: {
      sourceUnit: true,
      targetUnit: true,
    },
  })
}

export async function updateDataSharingRule(
  ruleId: string,
  ruleData: Partial<{
    name: string
    description?: string
    dataTypes: string[]
    accessLevel: "READ" | "WRITE" | "FULL"
    conditions: string[]
    isActive: boolean
  }>,
) {
  return await prisma.dataSharingRule.update({
    where: { id: ruleId },
    data: ruleData,
    include: {
      sourceUnit: true,
      targetUnit: true,
    },
  })
}

export async function deleteDataSharingRule(ruleId: string) {
  return await prisma.dataSharingRule.delete({
    where: { id: ruleId },
  })
}

export async function getDataSharingRules(organizationId: string) {
  return await prisma.dataSharingRule.findMany({
    where: { organizationId },
    include: {
      sourceUnit: true,
      targetUnit: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
