import type { AppData, TeamMember, Task } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

class JsonFileStorageClass {
  private cache: AppData | null = null;

  async loadData(): Promise<AppData> {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache = data;
      return data;
    } catch (error) {
      console.error('Error loading data from JSON file:', error);
      
      // Fallback to default data if API is not available
      const defaultData: AppData = {
        teamMembers: [
          {
            id: 'john-doe',
            name: 'John',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'jane-doe',
            name: 'Doe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'felix-smith',
            name: 'Felix',
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task-3',
            title: 'Implement authentication system',
            score: 13,
            assignedTo: 'felix-smith',
            priority: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'task-4',
            title: 'Write unit tests',
            score: 3,
            assignedTo: 'john-doe',
            priority: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };
      
      this.cache = defaultData;
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

      const updatedData = await response.json();
      this.cache = updatedData;
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

  async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const data = await this.loadData();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      .filter(t => t.assignedTo === memberId)
      .sort((a, b) => a.priority - b.priority);
  }

  async getTeamMemberWorkload(): Promise<Array<{ memberId: string; memberName: string; totalScore: number; taskCount: number }>> {
    const data = await this.loadData();
    
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
  }
}

export const JsonFileStorage = new JsonFileStorageClass();
