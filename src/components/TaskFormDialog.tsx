import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TeamMember, TaskFormData } from "@/types";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
  teamMembers: TeamMember[];
  editingTask?: Task | null;
  selectedMemberId?: string | null;
}

export function TaskFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  teamMembers, 
  editingTask,
  selectedMemberId
}: TaskFormDialogProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    score: 1,
    deadline: '',
    assignedTo: '',
  });

  const [errors, setErrors] = useState<{ [K in keyof TaskFormData]?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        score: editingTask.score,
        deadline: editingTask.deadline ? editingTask.deadline.split('T')[0] : '',
        assignedTo: editingTask.assignedTo,
      });
    } else {
      setFormData({
        title: '',
        score: 1,
        deadline: '',
        assignedTo: selectedMemberId || teamMembers[0]?.id || '',
      });
    }
    setErrors({});
  }, [editingTask, teamMembers, selectedMemberId, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof TaskFormData]?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.score < 1 || formData.score > 100) {
      newErrors.score = 'Score must be between 1 and 100';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please select a team member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: TaskFormData = {
      ...formData,
      deadline: formData.deadline || undefined,
    };

    onSubmit(submitData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      score: 1,
      deadline: '',
      assignedTo: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
          <DialogDescription>
            {editingTask 
              ? 'Update the task details below.'
              : 'Create a new task and assign it to a team member.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className={errors.title ? 'form-error-border' : ''}
            />
            {errors.title && (
              <p className="text-sm form-error">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Score (1-100) *</Label>
            <Input
              id="score"
              type="number"
              min="1"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) || 1 })}
              className={errors.score ? 'form-error-border' : ''}
            />
            {errors.score && (
              <p className="text-sm form-error">{errors.score}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign to *</Label>
            <Select 
              value={formData.assignedTo} 
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
            >
              <SelectTrigger className={errors.assignedTo ? 'form-error-border' : ''}>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedTo && (
              <p className="text-sm form-error">{errors.assignedTo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            {/* Note: Native date input calendar popup styling is controlled by the browser */}
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
