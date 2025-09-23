export interface Task {
  id: string;
  title: string;
  score: number;
  deadline?: string; // ISO date string
  assignedTo: string; // team member id
  priority: number; // position in the list (0 = highest priority)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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
  lastUpdated: string; // ISO date string
}

export interface TaskFormData {
  title: string;
  score: number;
  deadline?: string;
  assignedTo: string;
}
