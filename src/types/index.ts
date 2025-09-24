export interface Task {
  id: string;
  title: string;
  score: number;
  deadline?: string; // ISO date string
  assignedTo: string; // team member id
  priority: number; // position in the list (0 = highest priority)
  status: 'active' | 'completed';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  completedAt?: string; // ISO date string when task was marked as done
}

export interface TeamMember {
  id: string;
  name: string;
  order: number; // position in the list (0 = first position)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface AppData {
  teamMembers: TeamMember[];
  tasks: Task[];
  completedTasks: Task[]; // Array of completed tasks for history
  lastUpdated: string; // ISO date string
}

export interface TaskFormData {
  title: string;
  score: number;
  deadline?: string;
  assignedTo: string;
}
