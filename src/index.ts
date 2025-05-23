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


// const taskMangr = new TaskManagementSystem();


// console.log("Creating users...");
// // const user1 = taskMangr.createUser("Joyce", "joyce@example.com");
// // const user2 = taskMangr.createUser("Creg", "creg@example.com");

// //new test instance for presentation
// const user3 = taskMangr.createUser("Melissa", "mellisawanja254@gmail.com");
// const user4 = taskMangr.createUser("Tracy", "tracy@yopmail.com")
// console.log("Users created:", taskMangr.getAllUsers());

// console.log("\nCreating tasks...");
// // const task1 = taskMangr.createTask(
// //   "Implement Login", 
// //   "Create a login form with validation",
// //   TaskStatus.TODO,
// //   new Date(2023, 11, 31)
// // );
// // const task2 = taskMangr.createTask(
// //   "Design Database", 
// //   "Design the database schema for the application"
// // );

// //new test instance for resentation
// const task3 = taskMangr.createTask(
//   "Implementation of a management system",
//   "Help integrate the new management system into the existing application",
//   TaskStatus.TODO,
//   new Date(2023, 11, 31),

// )
// const task4 = taskMangr.createTask(
//   "Design Database",
//   "Design database schema for the application",
//    TaskStatus.COMPLETED,
//   new Date(2025, 12, 21),
// );
// console.log("Tasks created:", taskMangr.getAllTasks());

// // Assign tasks to the users
// console.log("\nAssigning tasks to users...");
// // taskMangr.assignTaskToUser(task1.id, user1.id);
// // taskMangr.assignTaskToUser(task2.id, user2.id);

// //new test instance for presentation
// taskMangr.assignTaskToUser(task3.id, user3.id);

// // Get tasks for a specific user
// // console.log("\nTasks for user:", user1.name);
// // console.log(taskMangr.getUserTasks(user1.id));

// //new test instance for presentation
// console.log("\nTasks for user 3:", user3.name);
// console.log(taskMangr.getUserTasks(user3.id));



// // Update a task
// console.log("\nUpdating task...");
// // const updatedTask = taskMangr.updateTask(task1.id, { 
// //   status: TaskStatus.IN_PROGRESS,
// //   description: "Create a login form with validation and error handling"
// // });
// // console.log("Updated task:", updatedTask);

// //new test instance for presentation

// const updatedTask3 = taskMangr.updateTask(task3.id, {
//   status:TaskStatus.IN_PROGRESS,
//   description: "Also includes training of the end-users"
// });

// console.log("Updated task:", updatedTask3);

// // Unassign a task
// console.log("\nUnassigning task...");
// // taskMangr.unassignTask(task1.id);
// // console.log("Tasks for user after unassignment:", taskManager.getUserTasks(user1.id));

// //new test instance for presentation
// taskMangr.unassignTask(task3.id);
// console.log("Tasks for Mellisa after unassignment: ", taskMangr.getUserTasks(user3.id));


// // // Delete a user
// console.log("\nDeleting user...");
// // taskMangr.deleteUser(user2.id);
// // console.log("Users after deletion:", taskManager.getAllUsers());

// //new test instance for presentation
// taskMangr.deleteUser(user3.id);
// console.log("Users after deletion:", taskMangr.getAllUsers());


// // // Delete a task
// console.log("\nDeleting task...");
// // taskMangr.deleteTask(task2.id);
// // console.log("Tasks after deletion:", taskManager.getAllTasks());

// //new test instance for presentation
// taskMangr.deleteTask(task3.id);
// console.log("Tasks after deletion:", taskMangr.getAllTasks());
//end of the log to the terminal


//Class to implement to the UI.
class TaskManagement {
    private taskManager: TaskManagementSystem;
    
    constructor() {
        this.taskManager = new TaskManagementSystem();
        this.initializeEventListeners();
        this.refreshAllLists();
        this.initializeListToggles();
        this.initializeTabNavigation();
        this.setupEditButtons();
    }
    
    private initializeEventListeners(): void {
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.addUser());
        document.getElementById('add-task-btn')?.addEventListener('click', () => this.addTask());
        document.getElementById('assign-btn')?.addEventListener('click', () => this.assignTask());
        document.getElementById('view-tasks-btn')?.addEventListener('click', () => this.viewUserTasks());
    }
    
    private addUser(): void {
        const idInput = document.getElementById('editing-user-id') as HTMLInputElement;
        const nameInput = document.getElementById('user-name') as HTMLInputElement;
        const emailInput = document.getElementById('user-email') as HTMLInputElement;
        
        if (!nameInput.value || !emailInput.value) {
            alert('Please enter both name and email');
            return;
        }
        
        try {
            if (this.isEditingUser) {
                this.taskManager.updateUser(idInput.value, {
                    name: nameInput.value,
                    email: emailInput.value
                });
                
                this.cancelUserEdit();
            } else {
                this.taskManager.createUser(nameInput.value, emailInput.value);
                
                nameInput.value = '';
                emailInput.value = '';
            }
            
            this.refreshAllLists();
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private addTask(): void {
        const idInput = document.getElementById('editing-task-id') as HTMLInputElement;
        const titleInput = document.getElementById('task-title') as HTMLInputElement;
        const descriptionInput = document.getElementById('task-description') as HTMLTextAreaElement;
        const statusSelect = document.getElementById('task-status') as HTMLSelectElement;
        const dueDateInput = document.getElementById('task-due-date') as HTMLInputElement;
        
        if (!titleInput.value || !descriptionInput.value) {
            alert('Please enter both title and description');
            return;
        }
        
        try {
            const status = statusSelect.value as TaskStatus;
            const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : undefined;
            
            if (this.isEditingTask) {
                this.taskManager.updateTask(idInput.value, {
                    title: titleInput.value,
                    description: descriptionInput.value,
                    status: status,
                    dueDate: dueDate
                });
                
                this.cancelTaskEdit();
            } else {
                this.taskManager.createTask(titleInput.value, descriptionInput.value, status, dueDate);
                
                titleInput.value = '';
                descriptionInput.value = '';
                statusSelect.value = 'TODO';
                dueDateInput.value = '';
            }
            
            this.refreshAllLists();
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private assignTask(): void {
        const taskSelect = document.getElementById('task-select') as HTMLSelectElement;
        const userSelect = document.getElementById('user-select') as HTMLSelectElement;
        
        if (!taskSelect.value || !userSelect.value) {
            alert('Please select both a task and a user');
            return;
        }
        
        try {
            this.taskManager.assignTaskToUser(taskSelect.value, userSelect.value);
            this.refreshAllLists();
        } catch (error) {
            alert(`Error assigning task: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private viewUserTasks(): void {
        const userSelect = document.getElementById('user-tasks-select') as HTMLSelectElement;
        
        if (!userSelect.value) {
            alert('Please select a user');
            return;
        }
        
        try {
            const tasks = this.taskManager.getUserTasks(userSelect.value);
            this.renderUserTasksList(tasks);
        } catch (error) {
            alert(`Error viewing tasks: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private refreshAllLists(): void {
        this.refreshUsersList();
        this.refreshTasksList();
        this.refreshDropdowns();
        
        const userTasksSelect = document.getElementById('user-tasks-select') as HTMLSelectElement;
        if (userTasksSelect.value) {
            try {
                const tasks = this.taskManager.getUserTasks(userTasksSelect.value);
                this.renderUserTasksList(tasks);
            } catch (error) {
                const userTasksList = document.getElementById('user-tasks-list');
                if (userTasksList) userTasksList.innerHTML = '';
            }
        }
    }
    
    private refreshUsersList(): void {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;
        
        usersList.innerHTML = '';
        
        try {
            const users = this.taskManager.getAllUsers();
            
            if (users.length === 0) {
                usersList.innerHTML = '<div class="empty-message">No users added yet</div>';
                return;
            }
            
            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'list-item';
                userItem.innerHTML = 
                `
                    <div class="item-header">
                        <div class="item-title">${this.escapeHtml(user.name)}</div>
                        <div class="item-actions">
                            <button class="action-btn edit-btn" data-id="${user.id}">Edit</button>
                            <button class="action-btn view-btn" data-id="${user.id}">View Tasks</button>
                            <button class="action-btn delete-btn" data-id="${user.id}">Delete</button>
                        </div>
                    </div>
                    <div class="item-content">
                        <div>Email: ${this.escapeHtml(user.email)}</div>
                    </div>
                    <div class="item-meta">
                        <div>ID: ${user.id}</div>
                        <div>Tasks: ${user.tasks.length}</div>
                    </div>
                `;
                
                usersList.appendChild(userItem);
                
                userItem.querySelector('.view-btn')?.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const userId = target.getAttribute('data-id');
                    if (userId) {
                        const userTasksSelect = document.getElementById('user-tasks-select') as HTMLSelectElement;
                        userTasksSelect.value = userId;
                        this.viewUserTasks();
                    }
                });
                
                userItem.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const userId = target.getAttribute('data-id');
                    if (userId && confirm('Are you sure you want to delete this user?')) {
                        try {
                            this.taskManager.deleteUser(userId);
                            this.refreshAllLists();
                        } catch (error) {
                            alert(`Error deleting user: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                });
            });
        } catch (error) {
            usersList.innerHTML = `<div class="error-message">Error loading users: ${error instanceof Error ? error.message : String(error)}</div>`;
        }
    }
    
    private refreshTasksList(): void {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;
        
        tasksList.innerHTML = '';
        
        try {
            const tasks = this.taskManager.getAllTasks();
            
            if (tasks.length === 0) {
                tasksList.innerHTML = '<div class="empty-message">No tasks added yet</div>';
                return;
            }
            
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'list-item';
                
                const formattedDueDate = task.dueDate 
                    ? new Date(task.dueDate).toLocaleDateString() 
                    : 'Not specified';
                
                let assignedUserName = 'Not assigned';
                if (task.assignedTo) {
                    try {
                        const user = this.taskManager.getUser(task.assignedTo);
                        assignedUserName = user.name;
                    } catch (error) {
                        assignedUserName = 'Unknown user';
                    }
                }
                
                taskItem.innerHTML = `
                    <div class="item-header">
                        <div class="item-title">${this.escapeHtml(task.title)}</div>
                        <div class="item-actions">
                            <button class="action-btn edit-btn" data-id="${task.id}">Edit</button>
                            ${task.assignedTo ? 
                                `<button class="action-btn unassign-btn" data-id="${task.id}">Unassign</button>` : 
                                ''}
                            <button class="action-btn delete-btn" data-id="${task.id}">Delete</button>
                        </div>
                    </div>
                    <div class="item-content">
                        <p>${this.escapeHtml(task.description)}</p>
                    </div>
                    <div class="item-meta">
                        <div><span class="status-badge status-${task.status}">${task.status}</span></div>
                        <div>Due: ${formattedDueDate}</div>
                        <div>Assigned to: ${this.escapeHtml(assignedUserName)}</div>
                        <div>ID: ${task.id}</div>
                    </div>
                `;
                
                tasksList.appendChild(taskItem);
                
                taskItem.querySelector('.unassign-btn')?.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const taskId = target.getAttribute('data-id');
                    if (taskId) {
                        try {
                            this.taskManager.unassignTask(taskId);
                            this.refreshAllLists();
                        } catch (error) {
                            alert(`Error unassigning task: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                });
                
                taskItem.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const taskId = target.getAttribute('data-id');
                    if (taskId && confirm('Are you sure you want to delete this task?')) {
                        try {
                            this.taskManager.deleteTask(taskId);
                            this.refreshAllLists();
                        } catch (error) {
                            alert(`Error deleting task: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                });
            });
        } catch (error) {
            tasksList.innerHTML = `<div class="error-message">Error loading tasks: ${error instanceof Error ? error.message : String(error)}</div>`;
        }
    }
    
    private renderUserTasksList(tasks: Task[]): void {
        const userTasksList = document.getElementById('user-tasks-list');
        if (!userTasksList) return;
        
        userTasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            userTasksList.innerHTML = '<div class="empty-message">No tasks assigned to this user</div>';
            return;
        }
        
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'list-item';
            
            const formattedDueDate = task.dueDate 
                ? new Date(task.dueDate).toLocaleDateString() 
                : 'Not specified';
            
            taskItem.innerHTML = `
                <div class="item-header">
                    <div class="item-title">${this.escapeHtml(task.title)}</div>
                    <div class="item-actions">
                        <button class="action-btn edit-btn" data-id="${task.id}">Edit</button>
                        <button class="action-btn unassign-btn" data-id="${task.id}">Unassign</button>
                    </div>
                </div>
                <div class="item-content">
                    <p>${this.escapeHtml(task.description)}</p>
                </div>
                <div class="item-meta">
                    <div><span class="status-badge status-${task.status}">${task.status}</span></div>
                    <div>Due: ${formattedDueDate}</div>
                    <div>ID: ${task.id}</div>
                </div>
            `;
            
            userTasksList.appendChild(taskItem);
            
            taskItem.querySelector('.unassign-btn')?.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const taskId = target.getAttribute('data-id');
                if (taskId) {
                    try {
                        this.taskManager.unassignTask(taskId);
                        this.refreshAllLists();
                    } catch (error) {
                        alert(`Error unassigning task: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            });
        });
    }
    
    private refreshDropdowns(): void {
        const userSelects = [
            document.getElementById('user-select') as HTMLSelectElement,
            document.getElementById('user-tasks-select') as HTMLSelectElement
        ];
        
        userSelects.forEach(select => {
            if (!select) return;
            
            const currentValue = select.value;
            
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            try {
                const users = this.taskManager.getAllUsers();
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.name;
                    select.appendChild(option);
                });
                
                if (currentValue) {
                    select.value = currentValue;
                }
            } catch (error) {
                console.error('Error populating user dropdown:', error);
            }
        });
        
        const taskSelect = document.getElementById('task-select') as HTMLSelectElement;
        if (taskSelect) {
            const currentValue = taskSelect.value;
            
            while (taskSelect.options.length > 1) {
                taskSelect.remove(1);
            }
            
            try {
                const tasks = this.taskManager.getAllTasks();
                tasks.forEach(task => {
                    const option = document.createElement('option');
                    option.value = task.id;
                    option.textContent = task.title;
                    taskSelect.appendChild(option);
                });
                
                if (currentValue) {
                    taskSelect.value = currentValue;
                }
            } catch (error) {
                console.error('Error populating task dropdown:', error);
            }
        }
    }
    
    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    initializeListToggles() {
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = (btn as HTMLElement).dataset.target;
                const targetList = targetId ? document.getElementById(targetId) : null;
                
                if (targetList) {
                    targetList.classList.toggle('collapsed');
                    btn.textContent = targetList.classList.contains('collapsed') 
                        ? 'Show List' 
                        : 'Hide List';
                }
            });
        });
    }

    initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const sections = document.querySelectorAll('.section');
        
        const userSection = document.getElementById('user-section');
        if (userSection) {
            userSection.classList.add('active');
        }
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                btn.classList.add('active');
                
                const targetSection = document.getElementById((btn as HTMLElement).dataset.tab ?? '');
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }

    private isEditingUser = false;
    private isEditingTask = false;
    
    private setupEditButtons(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            if (target.classList.contains('edit-btn')) {
                const id = target.getAttribute('data-id');
                if (!id) return;
                
                if (target.closest('#users-list')) {
                    console.log("Editing user with ID:", id);
                    this.switchToUserEditMode(id);
                } else if (target.closest('#tasks-list') || target.closest('#user-tasks-list')) {
                    console.log("Editing task with ID:", id);
                    this.switchToTaskEditMode(id);
                }
            }
        });
        
        document.getElementById('cancel-edit-user-btn')?.addEventListener('click', () => {
            this.cancelUserEdit();
        });
        
        document.getElementById('cancel-edit-task-btn')?.addEventListener('click', () => {
            this.cancelTaskEdit();
        });
    }
    
    private switchToUserEditMode(userId: string): void {
        try {
            const user = this.taskManager.getUser(userId);
            
            const idInput = document.getElementById('editing-user-id') as HTMLInputElement;
            const nameInput = document.getElementById('user-name') as HTMLInputElement;
            const emailInput = document.getElementById('user-email') as HTMLInputElement;
            const addButton = document.getElementById('add-user-btn') as HTMLButtonElement;
            const cancelButton = document.getElementById('cancel-edit-user-btn') as HTMLButtonElement;
            
            idInput.value = user.id;
            nameInput.value = user.name;
            emailInput.value = user.email;
            
            addButton.textContent = 'Update User';
            cancelButton.style.display = 'block';
            
            document.querySelector('#user-section .form-container')?.scrollIntoView({ behavior: 'smooth' });
            
            this.isEditingUser = true;
            
        } catch (error) {
          console.error(`Error:`, error),
            alert(`Error loading user: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private cancelUserEdit(): void {
        const idInput = document.getElementById('editing-user-id') as HTMLInputElement;
        const nameInput = document.getElementById('user-name') as HTMLInputElement;
        const emailInput = document.getElementById('user-email') as HTMLInputElement;
        const addButton = document.getElementById('add-user-btn') as HTMLButtonElement;
        const cancelButton = document.getElementById('cancel-edit-user-btn') as HTMLButtonElement;
        
        idInput.value = '';
        nameInput.value = '';
        emailInput.value = '';
        
        addButton.textContent = 'Add User';
        cancelButton.style.display = 'none';
        
        this.isEditingUser = false;
    }
    
    private switchToTaskEditMode(taskId: string): void {
        try {
            const task = this.taskManager.getTask(taskId);
            
            const idInput = document.getElementById('editing-task-id') as HTMLInputElement;
            const titleInput = document.getElementById('task-title') as HTMLInputElement;
            const descriptionInput = document.getElementById('task-description') as HTMLTextAreaElement;
            const statusSelect = document.getElementById('task-status') as HTMLSelectElement;
            const dueDateInput = document.getElementById('task-due-date') as HTMLInputElement;
            const addButton = document.getElementById('add-task-btn') as HTMLButtonElement;
            const cancelButton = document.getElementById('cancel-edit-task-btn') as HTMLButtonElement;
            
            idInput.value = task.id;
            titleInput.value = task.title;
            descriptionInput.value = task.description;
            statusSelect.value = task.status;
            
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dueDateInput.value = `${year}-${month}-${day}`;
            } else {
                dueDateInput.value = '';
            }
            
            addButton.textContent = 'Update Task';
            cancelButton.style.display = 'block';
            
            document.querySelector('#task-section .form-container')?.scrollIntoView({ behavior: 'smooth' });
            
            this.isEditingTask = true;
            
        } catch (error) {
            alert(`Error loading task: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    private cancelTaskEdit(): void {
        const idInput = document.getElementById('editing-task-id') as HTMLInputElement; 
        const titleInput = document.getElementById('task-title') as HTMLInputElement;
        const descriptionInput = document.getElementById('task-description') as HTMLTextAreaElement;
        const statusSelect = document.getElementById('task-status') as HTMLSelectElement;
        const dueDateInput = document.getElementById('task-due-date') as HTMLInputElement;
        const addButton = document.getElementById('add-task-btn') as HTMLButtonElement;
        const cancelButton = document.getElementById('cancel-edit-task-btn') as HTMLButtonElement;
        
        idInput.value = '';
        titleInput.value = '';
        descriptionInput.value = '';
        statusSelect.value = 'TODO';
        dueDateInput.value = '';
        
        addButton.textContent = 'Add Task';
        cancelButton.style.display = 'none';
        
        this.isEditingTask = false;
    }
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
      new TaskManagement();
  });
}

