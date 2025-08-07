import { prisma } from "@/lib/prisma"

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      include: {
        unitAssignments: {
          include: {
            unit: true,
            role: true,
          },
        },
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }
}

export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        unitAssignments: {
          include: {
            unit: true,
            role: true,
          },
        },
        organization: true,
        permissionOverrides: {
          include: {
            permission: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    throw new Error("Failed to fetch user")
  }
}

export async function updateUser(
  userId: string,
  userData: {
    first_name?: string
    last_name?: string
    avatar?: string
    department?: string
    phone?: string
    location?: string
  },
) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: userData,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error("Failed to update user")
  }
}
