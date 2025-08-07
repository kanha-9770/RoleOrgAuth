import { prisma } from "@/lib/prisma"
import type { OrganizationUnitFormData } from "@/types/role"

export async function createOrganizationUnit(
  organizationId: string,
  unitData: OrganizationUnitFormData,
  parentId?: string,
) {
  try {
    const parentUnit = parentId
      ? await prisma.organizationUnit.findUnique({
          where: { id: parentId },
        })
      : null

    const unit = await prisma.organizationUnit.create({
      data: {
        name: unitData.name,
        description: unitData.description || "",
        organizationId,
        parentId,
        level: parentUnit ? parentUnit.level + 1 : 0,
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

    return await getOrganizationUnitById(unit.id)
  } catch (error) {
    console.error("Error creating organization unit:", error)
    throw new Error("Failed to create organization unit")
  }
}

export async function updateOrganizationUnit(unitId: string, unitData: Partial<OrganizationUnitFormData>) {
  try {
    await prisma.organizationUnit.update({
      where: { id: unitId },
      data: {
        name: unitData.name,
        description: unitData.description,
      },
    })

    return await getOrganizationUnitById(unitId)
  } catch (error) {
    console.error("Error updating organization unit:", error)
    throw new Error("Failed to update organization unit")
  }
}

export async function deleteOrganizationUnit(unitId: string) {
  try {
    // Delete all child units recursively
    const childUnits = await prisma.organizationUnit.findMany({
      where: { parentId: unitId },
    })

    for (const child of childUnits) {
      await deleteOrganizationUnit(child.id)
    }

    // Delete the unit
    await prisma.organizationUnit.delete({
      where: { id: unitId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting organization unit:", error)
    throw new Error("Failed to delete organization unit")
  }
}

export async function getOrganizationUnits(organizationId: string) {
  try {
    const units = await prisma.organizationUnit.findMany({
      where: {
        organizationId,
      },
      include: {
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
        children: true,
      },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    })

    // Build hierarchical structure
    return buildHierarchy(units)
  } catch (error) {
    console.error("Error fetching organization units:", error)
    throw new Error("Failed to fetch organization units")
  }
}

export async function getOrganizationUnitById(unitId: string) {
  try {
    return await prisma.organizationUnit.findUnique({
      where: { id: unitId },
      include: {
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
        children: true,
        parent: true,
      },
    })
  } catch (error) {
    console.error("Error fetching organization unit:", error)
    throw new Error("Failed to fetch organization unit")
  }
}

export async function assignRoleToUnit(unitId: string, roleId: string) {
  try {
    return await prisma.unitRoleAssignment.create({
      data: {
        unitId,
        roleId,
      },
    })
  } catch (error) {
    console.error("Error assigning role to unit:", error)
    throw new Error("Failed to assign role to unit")
  }
}

export async function removeRoleFromUnit(unitId: string, roleId: string) {
  try {
    return await prisma.unitRoleAssignment.delete({
      where: {
        unitId_roleId: {
          unitId,
          roleId,
        },
      },
    })
  } catch (error) {
    console.error("Error removing role from unit:", error)
    throw new Error("Failed to remove role from unit")
  }
}

export async function assignUserToUnit(userId: string, unitId: string, roleId: string, notes?: string) {
  try {
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
  } catch (error) {
    console.error("Error assigning user to unit:", error)
    throw new Error("Failed to assign user to unit")
  }
}

export async function removeUserFromUnit(userId: string, unitId: string) {
  try {
    return await prisma.userUnitAssignment.delete({
      where: {
        userId_unitId: {
          userId,
          unitId,
        },
      },
    })
  } catch (error) {
    console.error("Error removing user from unit:", error)
    throw new Error("Failed to remove user from unit")
  }
}

// Helper function to build hierarchical structure
function buildHierarchy(units: any[]): any[] {
  const unitMap = new Map()
  const rootUnits: any[] = []

  // Create a map of all units
  units.forEach((unit) => {
    unitMap.set(unit.id, { ...unit, children: [] })
  })

  // Build the hierarchy
  units.forEach((unit) => {
    if (unit.parentId) {
      const parent = unitMap.get(unit.parentId)
      if (parent) {
        parent.children.push(unitMap.get(unit.id))
      }
    } else {
      rootUnits.push(unitMap.get(unit.id))
    }
  })

  return rootUnits
}
