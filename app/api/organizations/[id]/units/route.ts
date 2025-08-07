import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationId = params.id

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
        children: {
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
          },
        },
      },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    })

    // Build hierarchical structure
    const buildHierarchy = (units: any[], parentId: string | null = null): any[] => {
      return units
        .filter((unit) => unit.parentId === parentId)
        .map((unit) => ({
          ...unit,
          children: buildHierarchy(units, unit.id),
          assignedRoles: unit.unitRoles?.map((ur: any) => ur.roleId) || [],
          assignedUsers:
            unit.userAssignments?.map((ua: any) => ({
              userId: ua.userId,
              roleId: ua.roleId,
            })) || [],
        }))
    }

    const hierarchicalUnits = buildHierarchy(units)

    return NextResponse.json(hierarchicalUnits)
  } catch (error) {
    console.error("Error fetching organization units:", error)
    return NextResponse.json({ error: "Failed to fetch organization units" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationId = params.id
    const { name, description, parentId, assignedRoles, assignedUsers } = await request.json()

    // Calculate level based on parent
    let level = 0
    if (parentId) {
      const parent = await prisma.organizationUnit.findUnique({
        where: { id: parentId },
      })
      if (parent) {
        level = parent.level + 1
      }
    }

    // Create the unit
    const unit = await prisma.organizationUnit.create({
      data: {
        name,
        description: description || "",
        organizationId,
        parentId,
        level,
      },
    })

    // Assign roles to unit
    if (assignedRoles && assignedRoles.length > 0) {
      await Promise.all(
        assignedRoles.map((roleId: string) =>
          prisma.unitRoleAssignment.create({
            data: {
              unitId: unit.id,
              roleId,
            },
          }),
        ),
      )
    }

    // Assign users to unit
    if (assignedUsers && assignedUsers.length > 0) {
      await Promise.all(
        assignedUsers.map((assignment: { userId: string; roleId: string }) =>
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

    // Return the created unit with all relationships
    const createdUnit = await prisma.organizationUnit.findUnique({
      where: { id: unit.id },
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
    })

    return NextResponse.json(createdUnit)
  } catch (error) {
    console.error("Error creating organization unit:", error)
    return NextResponse.json({ error: "Failed to create organization unit" }, { status: 500 })
  }
}
