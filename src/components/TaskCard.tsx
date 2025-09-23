import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
  dragListeners?: any;
}

export function TaskCard({ task, onEdit, onDelete, isDragging, dragListeners }: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();
  const isUpcoming = task.deadline && new Date(task.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <Card 
      className={`mb-2 cursor-move transition-all duration-200 ${
        isDragging ? 'rotate-2 shadow-lg scale-105' : 'hover:shadow-md'
      } ${isOverdue ? 'border-red-300 bg-red-50' : isUpcoming ? 'border-yellow-300 bg-yellow-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1" {...dragListeners}>
            <h4 className="font-medium text-sm mb-1">{task.title}</h4>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {task.score} pts
              </span>
              {task.deadline && (
                <div className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600' : isUpcoming ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(task.deadline), 'MMM d')}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
