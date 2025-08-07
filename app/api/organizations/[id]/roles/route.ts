import { type NextRequest, NextResponse } from "next/server"
import { createRole, getRolesByOrganization } from "@/lib/database/roles"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationId = params.id
    const roles = await getRolesByOrganization(organizationId)
    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationId = params.id
    const data = await request.json()

    const role = await createRole({
      ...data,
      organizationId,
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
  }
}
