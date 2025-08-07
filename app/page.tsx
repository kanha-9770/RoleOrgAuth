"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RoleProvider } from "@/context/role-context"
import { OrganizationTree } from "@/components/organization-tree"
import { RoleManagementSheet } from "@/components/role-management-sheet"
import { RoleFormModal } from "@/components/role-form-modal"
import { OrganizationUnitFormModal } from "@/components/organization-unit-form-modal"
import { Building2, Settings, Database, Shield, Users, ChevronUp, ChevronDown } from "lucide-react"
import { useRoles } from "@/context/role-context"
import { cn } from "@/lib/utils"
import { UserManagement } from "@/components/user-management"
import { PermissionManagement } from "@/components/permission-management"
import { DataSharingConfiguration } from "@/components/data-sharing-configuration"

interface Role {
  id: string
  name: string
  title?: string
  reportsTo?: string
  shareDataWithPeers: boolean
  description: string
  children: Role[]
}

interface HistoryState {
  roles: Role[]
  timestamp: number
  action: string
}

function OrganizationContent() {
  const { state, dispatch } = useRoles()

  const handleOpenRoleSheet = () => {
    dispatch({ type: "OPEN_ROLE_SHEET" })
  }

  const handleToggleHeader = () => {
    dispatch({ type: "TOGGLE_HEADER_COLLAPSE" })
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
      {/* Collapsible Main Header */}
      <div className={cn("mb-8 transition-all duration-300", state.isHeaderCollapsed && "mb-4")}>
        {!state.isHeaderCollapsed && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reliance Industries Limited</h1>
              <p className="text-gray-600">
                Organizational hierarchy management system with tree-based structure visualization
              </p>
            </div>
            <Button
              onClick={handleOpenRoleSheet}
              variant="outline"
              className="flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 bg-transparent"
              title="Open Role Management"
            >
              <Shield className="h-5 w-5" />
              <span className="mr-1">Roles</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-purple-700"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        )}

        {/* Header Toggle Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleHeader}
            className="text-gray-500 hover:text-gray-700 bg-white border border-gray-200 shadow-sm"
          >
            {state.isHeaderCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show Header
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Header
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8">
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <OrganizationTree />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionManagement />
        </TabsContent>

        <TabsContent value="data">
          <DataSharingConfiguration />
        </TabsContent>
      </Tabs>

      <RoleManagementSheet />
      <RoleFormModal />
      <OrganizationUnitFormModal />
    </div>
  )
}

export default function OrganizationManagement() {
  return (
    <RoleProvider>
      <OrganizationContent />
    </RoleProvider>
  )
}
