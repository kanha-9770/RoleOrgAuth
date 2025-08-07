import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")

    const dataSharingRules = await prisma.dataSharingRule.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        sourceUnit: true,
        targetUnit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(dataSharingRules)
  } catch (error) {
    console.error("Error fetching data sharing rules:", error)
    return NextResponse.json({ error: "Failed to fetch data sharing rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const dataSharingRule = await prisma.dataSharingRule.create({
      data: {
        ...data,
        organizationId: data.organizationId || "org_default",
      },
      include: {
        sourceUnit: true,
        targetUnit: true,
      },
    })

    return NextResponse.json(dataSharingRule)
  } catch (error) {
    console.error("Error creating data sharing rule:", error)
    return NextResponse.json({ error: "Failed to create data sharing rule" }, { status: 500 })
  }
}
