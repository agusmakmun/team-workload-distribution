import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WorkloadChart } from './components/WorkloadChart';
import { TeamMemberSection } from './components/TeamMemberSection';
import { TaskFormDialog } from './components/TaskFormDialog';
import { TeamManagementDialog } from './components/TeamManagementDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { JsonFileStorage } from './lib/jsonFileStorage';
import type { AppData, Task, TaskFormData, TeamMember } from './types';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Team Member Component
interface SortableTeamMemberProps {
  member: TeamMember;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskReorder: (taskId: string, newPriority: number) => void;
  onAddTask: (memberId: string) => void;
}

function SortableTeamMember({ 
  member, 
  tasks, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskReorder, 
  onAddTask 
}: SortableTeamMemberProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className={`${isDragging ? 'z-50 rotate-2 scale-105' : ''}`}
    >
      <TeamMemberSection
        member={member}
        tasks={tasks}
        onTaskEdit={onTaskEdit}
        onTaskDelete={onTaskDelete}
        onTaskReorder={onTaskReorder}
        onAddTask={onAddTask}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from JSON file
  const loadData = async () => {
    try {
      setLoading(true);
      const loadedData = await JsonFileStorage.loadData();
      setData(loadedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data whenever it changes
  const refreshData = async () => {
    await loadData();
  };

  // Task management
  const handleAddTask = (memberId: string) => {
    setEditingTask(null);
    setSelectedMemberId(memberId);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedMemberId(task.assignedTo);
    setIsTaskDialogOpen(true);
  };

  const handleTaskSubmit = async (taskData: TaskFormData) => {
    try {
      if (editingTask) {
        // Update existing task
        await JsonFileStorage.updateTask(editingTask.id, {
          title: taskData.title,
          score: taskData.score,
          deadline: taskData.deadline,
          assignedTo: taskData.assignedTo,
        });
      } else {
        // Create new task
        const tasksForMember = await JsonFileStorage.getTasksByMember(taskData.assignedTo);
        await JsonFileStorage.addTask({
          title: taskData.title,
          score: taskData.score,
          deadline: taskData.deadline,
          assignedTo: taskData.assignedTo,
          priority: tasksForMember.length, // Add at the end
        });
      }
      await refreshData();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await JsonFileStorage.deleteTask(taskToDelete);
      await refreshData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
    
    setTaskToDelete(null);
  };

  const handleTaskReorder = async (taskId: string, newPriority: number) => {
    if (!data) return;
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      try {
        await JsonFileStorage.reorderTasks(taskId, task.assignedTo, newPriority);
        await refreshData();
      } catch (error) {
        console.error('Failed to reorder task:', error);
      }
    }
  };

  // Team management
  const handleAddTeamMember = async (name: string) => {
    try {
      await JsonFileStorage.addTeamMember(name);
      await refreshData();
    } catch (error) {
      console.error('Failed to add team member:', error);
    }
  };

  const handleUpdateTeamMember = async (id: string, name: string) => {
    try {
      await JsonFileStorage.updateTeamMember(id, name);
      await refreshData();
    } catch (error) {
      console.error('Failed to update team member:', error);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      await JsonFileStorage.deleteTeamMember(id);
      await refreshData();
    } catch (error) {
      console.error('Failed to delete team member:', error);
    }
  };

  const handleTeamMemberReorder = async (memberId: string, newOrder: number) => {
    if (!data) return;
    try {
      await JsonFileStorage.reorderTeamMembers(memberId, newOrder);
      await refreshData();
    } catch (error) {
      console.error('Failed to reorder team member:', error);
    }
  };

  // Drag and drop sensors for team members
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle team member drag end
  const handleTeamMemberDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && data) {
      const oldIndex = data.teamMembers.findIndex(member => member.id === active.id);
      const newIndex = data.teamMembers.findIndex(member => member.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        handleTeamMemberReorder(active.id as string, newIndex);
      }
    }
  };

  // Get workload data for chart
  const getWorkloadData = () => {
    if (!data) return [];
    
    return data.teamMembers.map(member => {
      const memberTasks = data.tasks.filter(t => t.assignedTo === member.id);
      const totalScore = memberTasks.reduce((sum, task) => sum + task.score, 0);
      
      return {
        memberId: member.id,
        memberName: member.name,
        totalScore,
        taskCount: memberTasks.length,
      };
    });
  };

  // Get tasks by member
  const getTasksForMember = (memberId: string) => {
    if (!data) return [];
    return data.tasks
      .filter(task => task.assignedTo === memberId)
      .sort((a, b) => a.priority - b.priority);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Team Priority Tracker...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load data from JSON file.</p>
          <button 
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onManageTeam={() => setIsTeamDialogOpen(true)}
      />
      
      <main className="container mx-auto px-6 py-6">
        {/* Workload Chart */}
        <WorkloadChart data={getWorkloadData()} />
        
        {/* Team Members and Tasks */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTeamMemberDragEnd}
        >
          <SortableContext 
            items={data.teamMembers.sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.teamMembers
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((member) => (
                <SortableTeamMember
                  key={member.id}
                  member={member}
                  tasks={getTasksForMember(member.id)}
                  onTaskEdit={handleEditTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskReorder={handleTaskReorder}
                  onAddTask={handleAddTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* Dialogs */}
      <TaskFormDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setEditingTask(null);
          setSelectedMemberId(null);
        }}
        onSubmit={handleTaskSubmit}
        teamMembers={data.teamMembers}
        editingTask={editingTask}
        selectedMemberId={selectedMemberId}
      />

      <TeamManagementDialog
        isOpen={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
        teamMembers={data.teamMembers}
        onAddMember={handleAddTeamMember}
        onUpdateMember={handleUpdateTeamMember}
        onDeleteMember={handleDeleteTeamMember}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

export default App;