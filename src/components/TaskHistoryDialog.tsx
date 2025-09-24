import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, RotateCcw, Trophy, Trash2, Eraser } from 'lucide-react';
import type { Task, TeamMember } from '@/types';
import { format } from 'date-fns';
import { JsonFileStorage } from '@/lib/jsonFileStorage';

interface TaskHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
  onRefresh: () => void;
}

interface CompletedTaskCardProps {
  task: Task;
  onRestore: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

function CompletedTaskCard({ task, onRestore, onDelete }: CompletedTaskCardProps) {
  const completedDate = task.completedAt ? new Date(task.completedAt) : new Date(task.updatedAt);
  const wasOverdue = task.deadline && new Date(task.deadline) < completedDate;

  return (
    <Card className="mb-3 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1 text-green-900 dark:text-green-100">{task.title}</h4>
            <div className="flex items-center gap-3 text-xs text-green-700 dark:text-green-300">
              <span className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded-full flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {task.score} pts
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Completed {format(completedDate, 'MMM d, yyyy')}</span>
              </div>
              {task.deadline && (
                <div className={`flex items-center gap-1 ${
                  wasOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-300'
                }`}>
                  <span>
                    {wasOverdue ? 'Was overdue' : 'Completed on time'}
                    {task.deadline && ` (due ${format(new Date(task.deadline), 'MMM d')})`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(task.id)}
              className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-800 dark:hover:text-green-300"
              title="Restore to active tasks"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300"
              title="Delete permanently"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskHistoryDialog({ isOpen, onClose, member, onRefresh }: TaskHistoryDialogProps) {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCompletedTasks();
    }
  }, [isOpen, member.id]);

  const loadCompletedTasks = async () => {
    try {
      setLoading(true);
      const tasks = await JsonFileStorage.getCompletedTasksByMember(member.id);
      setCompletedTasks(tasks);
    } catch (error) {
      console.error('Failed to load completed tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (taskId: string) => {
    try {
      await JsonFileStorage.restoreTask(taskId);
      await loadCompletedTasks();
      onRefresh();
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await JsonFileStorage.deleteCompletedTask(taskId);
      await loadCompletedTasks();
    } catch (error) {
      console.error('Failed to delete completed task:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const deletedCount = await JsonFileStorage.clearAllCompletedTasksForMember(member.id);
      await loadCompletedTasks();
      onRefresh();
      console.log(`Cleared ${deletedCount} completed tasks for ${member.name}`);
    } catch (error) {
      console.error('Failed to clear all completed tasks:', error);
    }
  };

  const totalCompletedScore = completedTasks.reduce((sum, task) => sum + task.score, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            Completed Tasks - {member.name}
          </DialogTitle>
          <DialogDescription>
            View and manage completed tasks for this team member.
            {completedTasks.length > 0 && (
              <span className="block mt-1 text-green-600 font-medium">
                Total completed: {completedTasks.length} tasks • {totalCompletedScore} points
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : completedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm">No completed tasks yet.</p>
              <p className="text-xs text-muted-foreground/75 mt-1">
                Tasks marked as done will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <CompletedTaskCard
                  key={task.id}
                  task={task}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {completedTasks.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300 dark:hover:border-red-700"
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Completed Tasks?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''} 
                    for {member.name} ({totalCompletedScore} points total). 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAll}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear All Tasks
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
