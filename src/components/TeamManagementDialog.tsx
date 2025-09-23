import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TeamMember } from "@/types";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { AlertDialog } from "./AlertDialog";

interface TeamManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onAddMember: (name: string) => void;
  onUpdateMember: (id: string, name: string) => void;
  onDeleteMember: (id: string) => void;
}

export function TeamManagementDialog({
  isOpen,
  onClose,
  teamMembers,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: TeamManagementDialogProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState<{ id: string; name: string } | null>(null);
  const [errors, setErrors] = useState<{ add?: string; edit?: string }>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName.trim()) {
      setErrors({ ...errors, add: 'Name is required' });
      return;
    }

    if (teamMembers.some(member => member.name.toLowerCase() === newMemberName.trim().toLowerCase())) {
      setErrors({ ...errors, add: 'Member with this name already exists' });
      return;
    }

    onAddMember(newMemberName.trim());
    setNewMemberName('');
    setErrors({ ...errors, add: undefined });
  };

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMember || !editingMember.name.trim()) {
      setErrors({ ...errors, edit: 'Name is required' });
      return;
    }

    if (teamMembers.some(member => 
      member.id !== editingMember.id && 
      member.name.toLowerCase() === editingMember.name.trim().toLowerCase()
    )) {
      setErrors({ ...errors, edit: 'Member with this name already exists' });
      return;
    }

    onUpdateMember(editingMember.id, editingMember.name.trim());
    setEditingMember(null);
    setErrors({ ...errors, edit: undefined });
  };

  const handleDeleteMember = (id: string) => {
    if (teamMembers.length <= 1) {
      setIsAlertOpen(true);
      return;
    }

    setMemberToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    onDeleteMember(memberToDelete);
    setMemberToDelete(null);
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember({ id: member.id, name: member.name });
    setErrors({ ...errors, edit: undefined });
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setErrors({ ...errors, edit: undefined });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Manage Team Members
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove team members. Each member can have tasks assigned to them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Add New Member</Label>
            <form onSubmit={handleAddMember} className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={newMemberName}
                  onChange={(e) => {
                    setNewMemberName(e.target.value);
                    if (errors.add) setErrors({ ...errors, add: undefined });
                  }}
                  placeholder="Enter member name"
                  className={errors.add ? 'border-red-500' : ''}
                />
                {errors.add && (
                  <p className="text-sm text-red-500 mt-1">{errors.add}</p>
                )}
              </div>
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </form>
          </div>

          <Separator />

          {/* Current Members */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Current Members ({teamMembers.length})
            </Label>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-3">
                    {editingMember?.id === member.id ? (
                      <form onSubmit={handleEditMember} className="space-y-2">
                        <div>
                          <Input
                            value={editingMember.name}
                            onChange={(e) => {
                              setEditingMember({ ...editingMember, name: e.target.value });
                              if (errors.edit) setErrors({ ...errors, edit: undefined });
                            }}
                            placeholder="Enter member name"
                            className={errors.edit ? 'border-red-500' : ''}
                            autoFocus
                          />
                          {errors.edit && (
                            <p className="text-sm text-red-500 mt-1">{errors.edit}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" variant="default">
                            Save
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(member)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteMember}
        title="Delete Team Member"
        description="Are you sure you want to delete this team member? All their tasks will also be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Cannot Delete Team Member"
        description="You must have at least one team member."
        buttonText="OK"
        variant="warning"
      />
    </Dialog>
  );
}
