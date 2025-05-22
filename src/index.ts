interface Users {
  id: string;
  name: string;
  email: string;
  tasks: Tasks[];
}

interface Tasks {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string; 
  dueDate?: Date;
}

enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}


class User implements Users {
  id: string;
  name: string;
  email: string;
  tasks: Task[] = [];

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Task implements Tasks {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
  dueDate?: Date;

  constructor(
    id: string, 
    title: string, 
    description: string, 
    status: TaskStatus = TaskStatus.TODO,
    dueDate?: Date
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.dueDate = dueDate;
  }
}

class UserRepository {
  private users: Map<string, User> = new Map();

  createUser(user: User): User {
    if (this.users.has(user.id)) {
      throw new Error(`User with ID ${user.id} already exists.`);
    }
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, userData: Partial<Users>): User {
    const user = this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    if (userData.name) user.name = userData.name;
    if (userData.email) user.email = userData.email;

    return user;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
}

class TaskRepository {
  private tasks: Map<string, Task> = new Map();

  createTask(task: Task): Task {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with ID ${task.id} already exists.`);
    }
    this.tasks.set(task.id, task);
    return task;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  updateTask(id: string, taskData: Partial<Tasks>): Task {
    const task = this.getTaskById(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found.`);
    }

    if (taskData.title) task.title = taskData.title;
    if (taskData.description) task.description = taskData.description;
    if (taskData.status) task.status = taskData.status;
    if (taskData.dueDate) task.dueDate = taskData.dueDate;
    if (taskData.assignedTo !== undefined) task.assignedTo = taskData.assignedTo;

    return task;
  }

  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getTasksByUserId(userId: string): Task[] {
    return this.getAllTasks().filter(task => task.assignedTo === userId);
  }
}


class UserService {
  private userRepository: UserRepository;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  createUser(name: string, email: string): User {
    const id = this.generateId();
    const user = new User(id, name, email);
    return this.userRepository.createUser(user);
  }

  getUserById(id: string): User {
    const user = this.userRepository.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    return user;
  }

  getAllUsers(): User[] {
    return this.userRepository.getAllUsers();
  }

  updateUser(id: string, userData: Partial<Users>): User {
    return this.userRepository.updateUser(id, userData);
  }

  deleteUser(id: string): boolean {
    return this.userRepository.deleteUser(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;
  
  constructor(taskRepository: TaskRepository, userRepository: UserRepository) {
    this.taskRepository = taskRepository;
    this.userRepository = userRepository;
  }

  createTask(title: string, description: string, status: TaskStatus = TaskStatus.TODO, dueDate?: Date): Task {
    const id = this.generateId();
    const task = new Task(id, title, description, status, dueDate);
    return this.taskRepository.createTask(task);
  }

  getTaskById(id: string): Task {
    const task = this.taskRepository.getTaskById(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found.`);
    }
    return task;
  }

  getAllTasks(): Task[] {
    return this.taskRepository.getAllTasks();
  }

  updateTask(id: string, taskData: Partial<Tasks>): Task {
    return this.taskRepository.updateTask(id, taskData);
  }

  deleteTask(id: string): boolean {
    return this.taskRepository.deleteTask(id);
  }

  assignTaskToUser(taskId: string, userId: string): Task {
    const task = this.getTaskById(taskId);
    const user = this.userRepository.getUserById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    task.assignedTo = userId;
    user.tasks.push(task);
    
    return task;
  }

  unassignTask(taskId: string): Task {
    const task = this.getTaskById(taskId);
    
    if (task.assignedTo) {
      const user = this.userRepository.getUserById(task.assignedTo);
      if (user) {
        user.tasks = user.tasks.filter(t => t.id !== taskId);
      }
      task.assignedTo = undefined;
    }
    
    return task;
  }

  getTasksByUserId(userId: string): Task[] {
    const user = this.userRepository.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    return this.taskRepository.getTasksByUserId(userId);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}


class TaskManagementSystem {
  private userService: UserService;
  private taskService: TaskService;

  constructor() {
    const userRepository = new UserRepository();
    const taskRepository = new TaskRepository();
    
    this.userService = new UserService(userRepository);
    this.taskService = new TaskService(taskRepository, userRepository);
  }

  
  createUser(name: string, email: string): User {
    return this.userService.createUser(name, email);
  }

  getUser(id: string): User {
    return this.userService.getUserById(id);
  }

  getAllUsers(): User[] {
    return this.userService.getAllUsers();
  }

  updateUser(id: string, userData: Partial<Users>): User {
    return this.userService.updateUser(id, userData);
  }

  deleteUser(id: string): boolean {
    return this.userService.deleteUser(id);
  }



  createTask(title: string, description: string, status?: TaskStatus, dueDate?: Date): Task {
    return this.taskService.createTask(title, description, status, dueDate);
  }

  getTask(id: string): Task {
    return this.taskService.getTaskById(id);
  }

  getAllTasks(): Task[] {
    return this.taskService.getAllTasks();
  }

  updateTask(id: string, taskData: Partial<Tasks>): Task {
    return this.taskService.updateTask(id, taskData);
  }

  deleteTask(id: string): boolean {
    return this.taskService.deleteTask(id);
  }


  assignTaskToUser(taskId: string, userId: string): Task {
    return this.taskService.assignTaskToUser(taskId, userId);
  }

  unassignTask(taskId: string): Task {
    return this.taskService.unassignTask(taskId);
  }

  getUserTasks(userId: string): Task[] {
    return this.taskService.getTasksByUserId(userId);
  }
}


const taskMangr = new TaskManagementSystem();


console.log("Creating users...");
// const user1 = taskMangr.createUser("Joyce", "joyce@example.com");
// const user2 = taskMangr.createUser("Creg", "creg@example.com");

//new test instance for presentation
const user3 = taskMangr.createUser("Melissa", "mellisawanja254@gmail.com");
const user4 = taskMangr.createUser("Tracy", "tracy@yopmail.com")
console.log("Users created:", taskMangr.getAllUsers());

console.log("\nCreating tasks...");
// const task1 = taskMangr.createTask(
//   "Implement Login", 
//   "Create a login form with validation",
//   TaskStatus.TODO,
//   new Date(2023, 11, 31)
// );
// const task2 = taskMangr.createTask(
//   "Design Database", 
//   "Design the database schema for the application"
// );

//new test instance for resentation
const task3 = taskMangr.createTask(
  "Implementation of a management system",
  "Help integrate the new management system into the existing application",
  TaskStatus.TODO,
  new Date(2023, 11, 31)
)
console.log("Tasks created:", taskMangr.getAllTasks());

// Assign tasks to the users
console.log("\nAssigning tasks to users...");
// taskMangr.assignTaskToUser(task1.id, user1.id);
// taskMangr.assignTaskToUser(task2.id, user2.id);

//new test instance for presentation
taskMangr.assignTaskToUser(task3.id, user3.id);

// Get tasks for a specific user
// console.log("\nTasks for user:", user1.name);
// console.log(taskMangr.getUserTasks(user1.id));

//new test instance for presentation
console.log("\nTasks for user 3:", user3.name);
console.log(taskMangr.getUserTasks(user3.id));



// Update a task
console.log("\nUpdating task...");
// const updatedTask = taskMangr.updateTask(task1.id, { 
//   status: TaskStatus.IN_PROGRESS,
//   description: "Create a login form with validation and error handling"
// });
// console.log("Updated task:", updatedTask);

//new test instance for presentation

const updatedTask3 = taskMangr.updateTask(task3.id, {
  status:TaskStatus.IN_PROGRESS,
  description: "Also includes training of the end-users"
});

console.log("Updated task:", updatedTask3);

// Unassign a task
console.log("\nUnassigning task...");
// taskMangr.unassignTask(task1.id);
// console.log("Tasks for user after unassignment:", taskManager.getUserTasks(user1.id));

//new test instance for presentation
taskMangr.unassignTask(task3.id);
console.log("Tasks for Mellisa after unassignment: ", taskMangr.getUserTasks(user3.id));


// // Delete a user
console.log("\nDeleting user...");
// taskMangr.deleteUser(user2.id);
// console.log("Users after deletion:", taskManager.getAllUsers());

//new test instance for presentation
taskMangr.deleteUser(user3.id);
console.log("Users after deletion:", taskMangr.getAllUsers());


// // Delete a task
console.log("\nDeleting task...");
// taskMangr.deleteTask(task2.id);
// console.log("Tasks after deletion:", taskManager.getAllTasks());

//new test instance for presentation
taskMangr.deleteTask(task3.id);
console.log("Tasks after deletion:", taskMangr.getAllTasks());

