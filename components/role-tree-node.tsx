"use client"

import { useState } from "react"
import type { Role } from "@/types/role"
import { useRoles } from "@/context/role-context"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoleTreeNodeProps {
  role: Role
  isLast?: boolean
  parentLines?: boolean[]
  siblingIndex?: number
  totalSiblings?: number
}

export function RoleTreeNode({
  role,
  isLast = false,
  parentLines = [],
  siblingIndex = 0,
  totalSiblings = 1,
}: RoleTreeNodeProps) {
  const { state, dispatch } = useRoles()
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isExpanded = state.expandedNodes.has(role.id)
  const hasChildren = role.children.length > 0

  const handleToggleExpand = () => {
    dispatch({ type: "TOGGLE_EXPAND", payload: { roleId: role.id } })
  }

  const handleAddChild = () => {
    dispatch({
      type: "SELECT_ROLE",
      payload: {
        role: {
          id: "new",
          name: "",
          description: "",
          shareDataWithPeers: false,
          level: role.level + 1,
          children: [],
          parentId: role.id,
        } as Role,
      },
    })
  }

  const handleEdit = () => {
    // Create a copy of the role but remove parentId to indicate this is an edit operation
    const roleToEdit = { ...role }
    delete roleToEdit.parentId // Remove parentId to indicate editing

    dispatch({
      type: "SELECT_ROLE",
      payload: {
        role: roleToEdit,
      },
    })
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    dispatch({ type: "DELETE_ROLE", payload: { roleId: role.id } })
    setShowDeleteDialog(false)
  }

  const getLevelColor = (level: number) => {
    const colors = [
      "text-blue-800", // Executive level
      "text-purple-700", // Director level
      "text-green-700", // Manager level
      "text-orange-700", // Senior level
      "text-red-700", // Junior level
    ]
    return colors[level] || "text-gray-700"
  }

  const getTreePrefix = () => {
    let prefix = ""

    // Add parent lines
    parentLines.forEach((showLine) => {
      if (showLine) {
        prefix += "│   "
      } else {
        prefix += "    "
      }
    })

    // Add current level connector
    if (role.level > 0) {
      if (isLast) {
        prefix += "└── "
      } else {
        prefix += "├── "
      }
    }

    return prefix
  }

  return (
    <div>
      {/* Current node */}
      <div
        className={cn(
          "flex items-center group hover:bg-gray-50 py-1 px-2 rounded transition-colors duration-200",
          isHovered && "bg-gray-50",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tree structure prefix */}
        <span className="text-gray-400 select-none whitespace-pre">{getTreePrefix()}</span>

        {/* Expand/Collapse button for nodes with children */}
        {hasChildren && (
          <Button variant="ghost" size="sm" onClick={handleToggleExpand} className="p-0 h-4 w-4 mr-1 hover:bg-gray-200">
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}

        {/* Role name */}
        <span className={cn("font-medium", getLevelColor(role.level))}>{role.name}</span>

        {/* Data sharing indicator */}
        {role.shareDataWithPeers && (
          <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Shared</span>
        )}

        {/* Action buttons */}
        <div
          className={cn(
            "ml-auto flex items-center gap-1 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddChild}
            className="h-6 w-6 p-0 hover:bg-green-100 text-green-600"
            title="Add child role"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600"
            title="Edit role"
          >
            <Edit className="h-3 w-3" />
          </Button>
          {role.id !== "ceo-role" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
              title="Delete role"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {role.children.map((child, index) => (
            <RoleTreeNode
              key={child.id}
              role={child}
              isLast={index === role.children.length - 1}
              parentLines={[...parentLines, !isLast]}
              siblingIndex={index}
              totalSiblings={role.children.length}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{role.name}" and all its child roles? This action cannot be undone.
              {role.children.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    This role has {role.children.length} child role{role.children.length !== 1 ? "s" : ""} that will
                    also be deleted.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
