import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import { Plus, History } from "lucide-react";
import type { Task, TeamMember } from "@/types";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

function SortableTaskCard({ task, onEdit, onDelete, onComplete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard 
        task={task} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        onComplete={onComplete}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  );
}

interface TeamMemberSectionProps {
  member: TeamMember;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskReorder: (taskId: string, newPriority: number) => void;
  onAddTask: (memberId: string) => void;
  onViewHistory: (memberId: string) => void;
  dragListeners?: any;
  isDragging?: boolean;
}

export function TeamMemberSection({ 
  member, 
  tasks, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskComplete,
  onTaskReorder,
  onAddTask,
  onViewHistory,
  dragListeners,
  isDragging
}: TeamMemberSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);
  const totalScore = tasks.reduce((sum, task) => sum + task.score, 0);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex(task => task.id === active.id);
      const newIndex = sortedTasks.findIndex(task => task.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onTaskReorder(active.id as string, newIndex);
      }
    }
  }

  return (
    <Card className={`h-fit ${isDragging ? 'cursor-grabbing' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div 
            {...dragListeners}
            className={`cursor-grab flex-1 ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            <CardTitle className="text-lg">{member.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(member.id)}
              className="h-8 px-3"
              title="View completed tasks"
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
            <Button
              size="sm"
              onClick={() => onAddTask(member.id)}
              className="h-8 px-3"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
        <div 
          {...dragListeners}
          className={`text-sm text-muted-foreground cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {totalScore} pts
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tasks assigned</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedTasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                    onComplete={onTaskComplete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
