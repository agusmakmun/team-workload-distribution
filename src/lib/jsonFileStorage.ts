import type { AppData, TeamMember, Task } from '@/types';

const API_BASE_URL = 'http://localhost:8980/api';

class JsonFileStorageClass {

  async loadData(): Promise<AppData> {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading data from JSON file:', error);
      
      // Fallback to default data if API is not available
      const defaultData: AppData = {
        teamMembers: [
          {
            id: 'john-doe',
            name: 'John',
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'jane-doe',
            name: 'Doe',
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'felix-smith',
            name: 'Felix',
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        tasks: [
          {
            id: 'task-1',
            title: 'Setup project repository',
            score: 5,
            assignedTo: 'john-doe',
            priority: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task-2',
            title: 'Design user interface mockups',
            score: 8,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'jane-doe',
            priority: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task-3',
            title: 'Implement authentication system',
            score: 13,
            assignedTo: 'felix-smith',
            priority: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task-4',
            title: 'Write unit tests',
            score: 3,
            assignedTo: 'john-doe',
            priority: 1,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        completedTasks: [],
        lastUpdated: new Date().toISOString(),
      };
      
      return defaultData;
    }
  }

  async saveData(data: AppData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving data to JSON file:', error);
      throw error;
    }
  }

  async addTeamMember(name: string): Promise<TeamMember> {
    const data = await this.loadData();
    const maxOrder = data.teamMembers.length > 0 ? Math.max(...data.teamMembers.map(m => m.order || 0)) : -1;
    const newMember: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.teamMembers.push(newMember);
    await this.saveData(data);
    return newMember;
  }

  async updateTeamMember(id: string, name: string): Promise<TeamMember | null> {
    const data = await this.loadData();
    const memberIndex = data.teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) return null;
    
    data.teamMembers[memberIndex] = {
      ...data.teamMembers[memberIndex],
      name,
      updatedAt: new Date().toISOString(),
    };
    
    await this.saveData(data);
    return data.teamMembers[memberIndex];
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const data = await this.loadData();
    const initialLength = data.teamMembers.length;
    
    // Remove the team member
    data.teamMembers = data.teamMembers.filter(m => m.id !== id);
    
    // Remove all tasks assigned to this member
    data.tasks = data.tasks.filter(t => t.assignedTo !== id);
    
    if (data.teamMembers.length < initialLength) {
      await this.saveData(data);
      return true;
    }
    return false;
  }

  async reorderTeamMembers(memberId: string, newOrder: number): Promise<void> {
    const data = await this.loadData();
    
    // Find the member to reorder
    const memberToMove = data.teamMembers.find(m => m.id === memberId);
    if (!memberToMove) {
      throw new Error('Team member not found');
    }
    
    // Remove the member from the array
    data.teamMembers = data.teamMembers.filter(m => m.id !== memberId);
    
    // Insert the member at the new position
    data.teamMembers.splice(newOrder, 0, memberToMove);
    
    // Update all order values
    data.teamMembers.forEach((member, index) => {
      member.order = index;
      member.updatedAt = new Date().toISOString();
    });
    
    await this.saveData(data);
  }

  async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Task> {
    const data = await this.loadData();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.tasks.push(newTask);
    await this.saveData(data);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
    const data = await this.loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.saveData(data);
    return data.tasks[taskIndex];
  }

  async deleteTask(id: string): Promise<boolean> {
    const data = await this.loadData();
    const initialLength = data.tasks.length;
    
    data.tasks = data.tasks.filter(t => t.id !== id);
    
    if (data.tasks.length < initialLength) {
      await this.saveData(data);
      return true;
    }
    return false;
  }

  async reorderTasks(taskId: string, newAssignedTo: string, newPriority: number): Promise<boolean> {
    const data = await this.loadData();
    const task = data.tasks.find(t => t.id === taskId);
    
    if (!task) return false;
    
    // Update the moved task
    task.assignedTo = newAssignedTo;
    task.priority = newPriority;
    task.updatedAt = new Date().toISOString();
    
    // Reorder other tasks in the same assignee group
    const sameAssigneeTasks = data.tasks
      .filter(t => t.assignedTo === newAssignedTo && t.id !== taskId)
      .sort((a, b) => a.priority - b.priority);
    
    // Adjust priorities
    sameAssigneeTasks.forEach((t, index) => {
      if (index >= newPriority) {
        t.priority = index + 1;
        t.updatedAt = new Date().toISOString();
      } else {
        t.priority = index;
        t.updatedAt = new Date().toISOString();
      }
    });
    
    await this.saveData(data);
    return true;
  }

  async getTasksByMember(memberId: string): Promise<Task[]> {
    const data = await this.loadData();
    return data.tasks
      .filter(t => t.assignedTo === memberId && t.status === 'active')
      .sort((a, b) => a.priority - b.priority);
  }

  async completeTask(taskId: string): Promise<Task | null> {
    const data = await this.loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return null;
    
    const task = data.tasks[taskIndex];
    
    // Update task status and completion time
    const completedTask: Task = {
      ...task,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Remove from active tasks and add to completed tasks
    data.tasks.splice(taskIndex, 1);
    data.completedTasks.push(completedTask);
    
    // Reorder remaining tasks for the same member
    const remainingTasks = data.tasks
      .filter(t => t.assignedTo === task.assignedTo)
      .sort((a, b) => a.priority - b.priority);
    
    remainingTasks.forEach((t, index) => {
      t.priority = index;
      t.updatedAt = new Date().toISOString();
    });
    
    await this.saveData(data);
    return completedTask;
  }

  async getCompletedTasksByMember(memberId: string): Promise<Task[]> {
    const data = await this.loadData();
    return data.completedTasks
      .filter(t => t.assignedTo === memberId)
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
  }

  async restoreTask(taskId: string): Promise<Task | null> {
    const data = await this.loadData();
    const completedTaskIndex = data.completedTasks.findIndex(t => t.id === taskId);
    
    if (completedTaskIndex === -1) return null;
    
    const task = data.completedTasks[completedTaskIndex];
    
    // Get the highest priority for this member to add at the end
    const memberTasks = data.tasks.filter(t => t.assignedTo === task.assignedTo);
    const maxPriority = memberTasks.length > 0 ? Math.max(...memberTasks.map(t => t.priority)) : -1;
    
    // Restore task as active
    const restoredTask: Task = {
      ...task,
      status: 'active',
      priority: maxPriority + 1,
      updatedAt: new Date().toISOString(),
      completedAt: undefined,
    };
    
    // Remove from completed tasks and add back to active tasks
    data.completedTasks.splice(completedTaskIndex, 1);
    data.tasks.push(restoredTask);
    
    await this.saveData(data);
    return restoredTask;
  }

  async deleteCompletedTask(taskId: string): Promise<boolean> {
    const data = await this.loadData();
    const initialLength = data.completedTasks.length;
    
    // Remove the completed task permanently
    data.completedTasks = data.completedTasks.filter(t => t.id !== taskId);
    
    if (data.completedTasks.length < initialLength) {
      await this.saveData(data);
      return true;
    }
    return false;
  }

  async clearAllCompletedTasksForMember(memberId: string): Promise<number> {
    const data = await this.loadData();
    const initialLength = data.completedTasks.length;
    
    // Remove all completed tasks for this member
    data.completedTasks = data.completedTasks.filter(t => t.assignedTo !== memberId);
    
    const deletedCount = initialLength - data.completedTasks.length;
    
    if (deletedCount > 0) {
      await this.saveData(data);
    }
    
    return deletedCount;
  }

  async getTeamMemberWorkload(): Promise<Array<{ 
    memberId: string; 
    memberName: string; 
    activeScore: number;
    completedScore: number;
    totalScore: number; 
    activeTaskCount: number;
    completedTaskCount: number;
    totalTaskCount: number;
  }>> {
    const data = await this.loadData();
    
    // Ensure completedTasks array exists
    if (!data.completedTasks) {
      data.completedTasks = [];
    }
    
    return data.teamMembers.map(member => {
      const activeTasks = data.tasks.filter(t => t.assignedTo === member.id && t.status === 'active');
      const completedTasks = data.completedTasks.filter(t => t.assignedTo === member.id);
      
      const activeScore = activeTasks.reduce((sum, task) => sum + task.score, 0);
      const completedScore = completedTasks.reduce((sum, task) => sum + task.score, 0);
      
      return {
        memberId: member.id,
        memberName: member.name,
        activeScore,
        completedScore,
        totalScore: activeScore + completedScore,
        activeTaskCount: activeTasks.length,
        completedTaskCount: completedTasks.length,
        totalTaskCount: activeTasks.length + completedTasks.length,
      };
    });
  }
}

export const JsonFileStorage = new JsonFileStorageClass();
