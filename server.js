import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Priority API',
      version: '1.0.0',
      description: 'A simple API for managing team tasks and priorities',
      contact: {
        name: 'API Support',
        email: 'support@teampriority.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['id', 'title', 'score', 'assignedTo', 'priority'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique task identifier'
            },
            title: {
              type: 'string',
              description: 'Task title'
            },
            score: {
              type: 'number',
              description: 'Task complexity/effort score'
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Optional deadline for the task'
            },
            assignedTo: {
              type: 'string',
              description: 'ID of the team member assigned to this task'
            },
            priority: {
              type: 'number',
              description: 'Task priority (0 = highest priority)'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed'],
              description: 'Task status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task last update timestamp'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task completion timestamp'
            }
          }
        },
        TeamMember: {
          type: 'object',
          required: ['id', 'name', 'order'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique team member identifier'
            },
            name: {
              type: 'string',
              description: 'Team member name'
            },
            order: {
              type: 'number',
              description: 'Display order (0 = first position)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Member creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Member last update timestamp'
            }
          }
        },
        AppData: {
          type: 'object',
          properties: {
            teamMembers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TeamMember'
              }
            },
            tasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task'
              }
            },
            completedTasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task'
              }
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Data last update timestamp'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js'] // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Team Priority API Documentation'
}));

// Ensure data directory and file exist
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // Create default data if file doesn't exist
    const defaultData = {
      teamMembers: [
        {
          id: "john-doe",
          name: "John",
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "jane-doe", 
          name: "Doe",
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "felix-smith",
          name: "Felix",
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      tasks: [
        {
          id: "task-1",
          title: "Setup project repository",
          score: 5,
          assignedTo: "john-doe",
          priority: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "task-2", 
          title: "Design user interface mockups",
          score: 8,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: "jane-doe",
          priority: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "task-3",
          title: "Implement authentication system", 
          score: 13,
          assignedTo: "felix-smith",
          priority: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "task-4",
          title: "Write unit tests",
          score: 3,
          assignedTo: "john-doe", 
          priority: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    throw error;
  }
}

// Write data to JSON file
async function writeData(data) {
  try {
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2));
    return updatedData;
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
}

// API Routes

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Get all application data
 *     description: Retrieve all team members, tasks, and completed tasks
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: Successfully retrieved all data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppData'
 *       500:
 *         description: Failed to read data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

/**
 * @swagger
 * /api/data:
 *   put:
 *     summary: Update all application data
 *     description: Replace all application data with new data
 *     tags: [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppData'
 *     responses:
 *       200:
 *         description: Successfully updated all data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppData'
 *       500:
 *         description: Failed to write data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.put('/api/data', async (req, res) => {
  try {
    const updatedData = await writeData(req.body);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to write data' });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Add a new task to the system
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, score, assignedTo]
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Implement user authentication"
 *               score:
 *                 type: number
 *                 description: Task complexity/effort score
 *                 example: 8
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Optional deadline
 *                 example: "2024-12-31T23:59:59.000Z"
 *               assignedTo:
 *                 type: string
 *                 description: Team member ID
 *                 example: "john-doe"
 *               priority:
 *                 type: number
 *                 description: Task priority (0 = highest)
 *                 example: 0
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Server error
 */
app.post('/api/tasks', async (req, res) => {
  try {
    const data = await readData();
    const { title, score, deadline, assignedTo, priority } = req.body;
    
    if (!title || !score || !assignedTo) {
      return res.status(400).json({ message: 'Title, score, and assignedTo are required' });
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      score: Number(score),
      deadline: deadline || null,
      assignedTo,
      priority: Number(priority) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.tasks.push(newTask);
    await writeData(data);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Update an existing task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               score:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const data = await readData();
    const { id } = req.params;
    const { title, score, deadline, assignedTo } = req.body;

    const taskIndex = data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      title: title || data.tasks[taskIndex].title,
      score: Number(score) || data.tasks[taskIndex].score,
      deadline: deadline !== undefined ? deadline : data.tasks[taskIndex].deadline,
      assignedTo: assignedTo || data.tasks[taskIndex].assignedTo,
      updatedAt: new Date().toISOString(),
    };
    
    await writeData(data);
    res.json(data.tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const data = await readData();
    const { id } = req.params;

    const initialLength = data.tasks.length;
    data.tasks = data.tasks.filter(task => task.id !== id);
    
    if (data.tasks.length < initialLength) {
      await writeData(data);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/tasks/reorder', async (req, res) => {
  try {
    const data = await readData();
    const { taskId, newPriority, assignedTo } = req.body;

    let tasksForMember = data.tasks.filter(t => t.assignedTo === assignedTo).sort((a, b) => a.priority - b.priority);
    const taskToReorder = tasksForMember.find(t => t.id === taskId);

    if (!taskToReorder) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasksForMember = tasksForMember.filter(t => t.id !== taskId);
    tasksForMember.splice(newPriority, 0, taskToReorder);

    // Update priorities
    tasksForMember.forEach((task, index) => {
      const originalTaskIndex = data.tasks.findIndex(t => t.id === task.id);
      if (originalTaskIndex !== -1) {
        data.tasks[originalTaskIndex].priority = index;
        data.tasks[originalTaskIndex].updatedAt = new Date().toISOString();
      }
    });

    await writeData(data);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/team-members/reorder', async (req, res) => {
  try {
    const data = await readData();
    const { memberId, newOrder } = req.body;
    
    // Find the member to reorder
    const memberToMove = data.teamMembers.find(m => m.id === memberId);
    if (!memberToMove) {
      return res.status(404).json({ message: 'Team member not found' });
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
    
    await writeData(data);
    res.json({ message: 'Team member reordered successfully' });
  } catch (error) {
    console.error('Error reordering team member:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if the API server is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
async function startServer() {
  await ensureDataFile();
  app.listen(PORT, () => {
    console.log(`JSON Database API Server running on http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
  });
}

startServer().catch(console.error);
