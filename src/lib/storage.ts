import type { AppData, TeamMember, Task } from '@/types';

const STORAGE_KEY = 'team-priority-data';

// Default data
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
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
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

export class DataStorage {
  static loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that the data has the expected structure
        if (parsed.teamMembers && parsed.tasks && Array.isArray(parsed.teamMembers) && Array.isArray(parsed.tasks)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    
    // Return default data if no valid data is found
    return defaultData;
  }

  static saveData(data: AppData): void {
    try {
      const updatedData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  static addTeamMember(name: string): TeamMember {
    const data = this.loadData();
    const newMember: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.teamMembers.push(newMember);
    this.saveData(data);
    return newMember;
  }

  static updateTeamMember(id: string, name: string): TeamMember | null {
    const data = this.loadData();
    const memberIndex = data.teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) return null;
    
    data.teamMembers[memberIndex] = {
      ...data.teamMembers[memberIndex],
      name,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveData(data);
    return data.teamMembers[memberIndex];
  }

  static deleteTeamMember(id: string): boolean {
    const data = this.loadData();
    const initialLength = data.teamMembers.length;
    
    // Remove the team member
    data.teamMembers = data.teamMembers.filter(m => m.id !== id);
    
    // Remove all tasks assigned to this member
    data.tasks = data.tasks.filter(t => t.assignedTo !== id);
    
    if (data.teamMembers.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  static addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const data = this.loadData();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.tasks.push(newTask);
    this.saveData(data);
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task | null {
    const data = this.loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveData(data);
    return data.tasks[taskIndex];
  }

  static deleteTask(id: string): boolean {
    const data = this.loadData();
    const initialLength = data.tasks.length;
    
    data.tasks = data.tasks.filter(t => t.id !== id);
    
    if (data.tasks.length < initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  static reorderTasks(taskId: string, newAssignedTo: string, newPriority: number): boolean {
    const data = this.loadData();
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
    
    this.saveData(data);
    return true;
  }

  static getTasksByMember(memberId: string): Task[] {
    const data = this.loadData();
    return data.tasks
      .filter(t => t.assignedTo === memberId)
      .sort((a, b) => a.priority - b.priority);
  }

  static getTeamMemberWorkload(): Array<{ memberId: string; memberName: string; totalScore: number; taskCount: number }> {
    const data = this.loadData();
    
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
