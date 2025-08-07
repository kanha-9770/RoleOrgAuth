"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRoles } from "@/context/role-context"
import type { Role, RoleFormData } from "@/types/role"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield } from "lucide-react"

export function RoleFormModal() {
  const { state, dispatch, refreshData } = useRoles()
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    shareDataWithPeers: false,
  })
  const [loading, setLoading] = useState(false)

  const isOpen = state.selectedRole !== null
  const isEditing =
    state.selectedRole && state.selectedRole.id !== "new" && !state.selectedRole.hasOwnProperty("parentId")

  useEffect(() => {
    if (state.selectedRole) {
      if (state.selectedRole.id === "new") {
        // Creating new role
        setFormData({
          name: "",
          description: "",
          parentId: state.selectedRole.parentId,
          shareDataWithPeers: false,
        })
      } else if (state.selectedRole.hasOwnProperty("parentId")) {
        // Creating child role (has parentId property)
        setFormData({
          name: "",
          description: "",
          parentId: state.selectedRole.parentId,
          shareDataWithPeers: false,
        })
      } else {
        // Editing existing role (no parentId property)
        setFormData({
          name: state.selectedRole.name,
          description: state.selectedRole.description,
          shareDataWithPeers: state.selectedRole.shareDataWithPeers,
        })
      }
    }
  }, [state.selectedRole])

  const handleClose = () => {
    dispatch({ type: "SELECT_ROLE", payload: { role: null } })
    setFormData({
      name: "",
      description: "",
      shareDataWithPeers: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Role name is required")
      return
    }

    setLoading(true)

    try {
      if (state.selectedRole?.id === "new" || state.selectedRole?.hasOwnProperty("parentId")) {
        // Creating new role
        const response = await fetch(`/api/organizations/${state.organizationId}/roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            parentId: state.selectedRole.parentId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create role")
        }
      } else if (state.selectedRole && state.selectedRole.id !== "new") {
        // Editing existing role
        const response = await fetch(`/api/roles/${state.selectedRole.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error("Failed to update role")
        }
      }

      // Refresh data and close modal
      await refreshData()
      handleClose()
    } catch (error) {
      console.error("Error saving role:", error)
      alert("Failed to save role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getAllRoles = (roles: Role[]): Role[] => {
    const result: Role[] = []
    roles.forEach((role) => {
      result.push(role)
      result.push(...getAllRoles(role.children))
    })
    return result
  }

  const availableParents = getAllRoles(state.roles).filter((role) => role.id !== state.selectedRole?.id)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            {state.selectedRole?.id === "new" || state.selectedRole?.hasOwnProperty("parentId")
              ? "Create New Role"
              : "Edit Role"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name (e.g., Senior Software Engineer)"
              required
              className="focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {(state.selectedRole?.id === "new" || state.selectedRole?.hasOwnProperty("parentId")) && (
            <div className="space-y-2">
              <Label htmlFor="parent">Reports To</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger className="focus:ring-purple-500 focus:border-purple-500">
                  <SelectValue placeholder="Select parent role" />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {"  ".repeat(role.level)} {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter role description and responsibilities"
              rows={3}
              className="focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="shareData"
              checked={formData.shareDataWithPeers}
              onCheckedChange={(checked) => setFormData({ ...formData, shareDataWithPeers: !!checked })}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <div>
              <Label htmlFor="shareData" className="text-sm font-medium text-blue-900">
                Share Data with Peers
              </Label>
              <p className="text-xs text-blue-700">
                Allow this role to share data with roles at the same hierarchical level
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              {loading
                ? "Saving..."
                : state.selectedRole?.id === "new" || state.selectedRole?.hasOwnProperty("parentId")
                  ? "Create Role"
                  : "Update Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
