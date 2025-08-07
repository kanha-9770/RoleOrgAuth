import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")

    const permissions = await prisma.permission.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const permission = await prisma.permission.create({
      data: {
        ...data,
        organizationId: data.organizationId || "org_default",
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("Error creating permission:", error)
    return NextResponse.json({ error: "Failed to create permission" }, { status: 500 })
  }
}
