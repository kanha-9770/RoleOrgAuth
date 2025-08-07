import { prisma } from "@/lib/prisma"

export async function getPermissions(organizationId: string) {
  try {
    return await prisma.permission.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    throw new Error("Failed to fetch permissions")
  }
}

export async function getRolePermissions(roleId: string) {
  try {
    return await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    })
  } catch (error) {
    console.error("Error fetching role permissions:", error)
    throw new Error("Failed to fetch role permissions")
  }
}

export async function assignPermissionToRole(roleId: string, permissionId: string, canDelegate = false) {
  try {
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
  } catch (error) {
    console.error("Error assigning permission to role:", error)
    throw new Error("Failed to assign permission to role")
  }
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  try {
    return await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    })
  } catch (error) {
    console.error("Error removing permission from role:", error)
    throw new Error("Failed to remove permission from role")
  }
}
