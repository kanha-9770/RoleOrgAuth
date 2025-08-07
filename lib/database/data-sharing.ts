import { prisma } from "@/lib/prisma"

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
  try {
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
  } catch (error) {
    console.error("Error creating data sharing rule:", error)
    throw new Error("Failed to create data sharing rule")
  }
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
  try {
    return await prisma.dataSharingRule.update({
      where: { id: ruleId },
      data: ruleData,
      include: {
        sourceUnit: true,
        targetUnit: true,
      },
    })
  } catch (error) {
    console.error("Error updating data sharing rule:", error)
    throw new Error("Failed to update data sharing rule")
  }
}

export async function deleteDataSharingRule(ruleId: string) {
  try {
    return await prisma.dataSharingRule.delete({
      where: { id: ruleId },
    })
  } catch (error) {
    console.error("Error deleting data sharing rule:", error)
    throw new Error("Failed to delete data sharing rule")
  }
}

export async function getDataSharingRules(organizationId: string) {
  try {
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
  } catch (error) {
    console.error("Error fetching data sharing rules:", error)
    throw new Error("Failed to fetch data sharing rules")
  }
}
