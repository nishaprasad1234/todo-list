
let tasks = [];

let savedTasks = localStorage.getItem("tasks");

if (savedTasks) {
    try {
        tasks = JSON.parse(savedTasks) || [];
    } catch (error) {
        tasks = [];
    }
}

let taskInput = document.querySelector("#taskInput");
let addTask = document.querySelector("#addTask");
let priority = document.querySelector("#priority");
let dueDate = document.querySelector("#dueDate");
let taskList = document.querySelector("#taskList");
let taskCounter = document.querySelector("#taskCounter");
let completedCounter = document.querySelector("#completedCounter");
let remainingCounter = document.querySelector("#remainingCounter");
let clearAll = document.querySelector("#clearAll");
let searchInput = document.querySelector("#searchInput");
let filterTask = document.querySelector("#filterTask");
let sortPriority = document.querySelector("#sortPriority");
let darkModeBtn = document.querySelector("#darkModeBtn");
let currentSort = "default";
let editForm = document.querySelector("#editForm");
let editTaskInput = document.querySelector("#editTaskInput");
let editPriority = document.querySelector("#editPriority");
let editDueDate = document.querySelector("#editDueDate");
let saveEditBtn = document.querySelector("#saveEditBtn");
let cancelEditBtn = document.querySelector("#cancelEditBtn");

let taskBeingEdited = null;

// Save tasks in LocalStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update all counters
function updateCounters() {
    let total = tasks.length;
    let completed = tasks.filter(function(task) {
        return task.completed === true;
    }).length;

    let remaining = total - completed;

    taskCounter.innerText = "Total Tasks: " + total;
    completedCounter.innerText = "Completed: " + completed;
    remainingCounter.innerText = "Remaining: " + remaining;
}

// Check search and filter conditions
function applySearchAndFilter() {
    let searchText = searchInput.value.toLowerCase().trim();
    let selectedFilter = filterTask.value;
    let allTasks = taskList.children;

    for (let i = 0; i < allTasks.length; i++) {
        let task = allTasks[i].taskData;

        if (!task) continue;

        let matchesSearch = task.text
            .toLowerCase()
            .includes(searchText);

        let matchesFilter = false;

        if (selectedFilter === "all") {
            matchesFilter = true;
        } else if (selectedFilter === "completed") {
            matchesFilter = task.completed === true;
        } else if (selectedFilter === "remaining") {
            matchesFilter = task.completed !== true;
        } else {
            matchesFilter = task.priority === selectedFilter;
        }

        allTasks[i].style.display =
            matchesSearch && matchesFilter ? "" : "none";
    }
}

// Create a task on the screen
function createTask(task) {
    let li = document.createElement("li");
    li.taskData = task;

    if (task.completed) {
        li.classList.add("completed");
    }

    let taskText = document.createElement("span");
    taskText.innerText = task.text + " - ";
    li.appendChild(taskText);

    // Priority
    let prioritySpan = document.createElement("span");
    prioritySpan.innerText = task.priority || "Low";
    prioritySpan.classList.add(
        "priority-" + (task.priority || "Low").toLowerCase()
    );
    li.appendChild(prioritySpan);

    // Due date
    let dateSpan = document.createElement("span");

    if (task.dueDate) {
        dateSpan.innerText = " Date: " + task.dueDate;

        let today = new Date();
        today.setHours(0, 0, 0, 0);

        let due = new Date(task.dueDate + "T00:00:00");
        let tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (due < today) {
            dateSpan.innerText += " - Overdue";
            dateSpan.classList.add("overdue");
        } else if (due.getTime() === today.getTime()) {
            dateSpan.innerText += " - Today";
        } else if (due.getTime() === tomorrow.getTime()) {
            dateSpan.innerText += " - Tomorrow";
        }
    }

    li.appendChild(dateSpan);

    // Edit button
    let editButton = document.createElement("button");
    editButton.innerText = "Edit";

    
  editButton.addEventListener("click", function(event) {
    event.stopPropagation();

    taskBeingEdited = task;

    editTaskInput.value = task.text;
    editPriority.value = task.priority || "Low";
    editDueDate.value = task.dueDate || "";

    editForm.style.display = "block";

    editTaskInput.focus();
});

    // Delete button
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";

    deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();

        tasks = tasks.filter(function(item) {
            return item !== task;
        });

        saveTasks();
        renderTasks();
    });

    // Mark complete or incomplete
    li.addEventListener("click", function(event) {
        if (
            event.target === editButton ||
            event.target === deleteButton
        ) {
            return;
        }

        task.completed = !task.completed;

        saveTasks();
        renderTasks();
    });

    li.appendChild(editButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
}

// Render all tasks, including sorting
function renderTasks() {
    taskList.innerHTML = "";

    let displayedTasks = [...tasks];

    let rank = {
        High: 3,
        Medium: 2,
        Low: 1
    };

    if (currentSort === "high-low") {
        displayedTasks.sort(function(a, b) {
            return (rank[b.priority] || 0) -
                   (rank[a.priority] || 0);
        });
    } else if (currentSort === "low-high") {
        displayedTasks.sort(function(a, b) {
            return (rank[a.priority] || 0) -
                   (rank[b.priority] || 0);
        });
    }

    displayedTasks.forEach(function(task) {
        createTask(task);
    });

    updateCounters();
    applySearchAndFilter();
}

// Add a new task
addTask.addEventListener("click", function() {
    let taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    let newTask = {
        text: taskText,
        priority: priority.value || "Low",
        dueDate: dueDate.value || "",
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dueDate.value = "";
});

// Press Enter to add a task
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask.click();
    }
});

// Clear all tasks
clearAll.addEventListener("click", function() {
    if (tasks.length === 0) return;

    let confirmClear = confirm("Are you sure you want to delete all tasks?");

    if (!confirmClear) return;

    tasks = [];
    saveTasks();
    renderTasks();
});

// Search tasks
searchInput.addEventListener("input", applySearchAndFilter);

// Filter tasks
filterTask.addEventListener("change", applySearchAndFilter);

// Sort tasks by priority
sortPriority.addEventListener("change", function() {
    currentSort = sortPriority.value;
    renderTasks();
});

// Dark Mode
let savedTheme = localStorage.getItem("darkMode");

if (savedTheme === "true") {
    document.body.classList.add("dark-mode");
    darkModeBtn.innerText = "Light Mode";
} else {
    darkModeBtn.innerText = "Dark Mode";
}

darkModeBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    let isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDark);

    darkModeBtn.innerText = isDark ? "Light Mode" : "Dark Mode";
});

// Show saved tasks when the page opens
renderTasks();

saveEditBtn.addEventListener("click", function(event) {
    event.preventDefault();

    if (taskBeingEdited === null) {
        alert("Please select a task to edit.");
        return;
    }

    let newTask = editTaskInput.value.trim();

    if (newTask === "") {
        alert("Please enter a task name!");
        return;
    }

    taskBeingEdited.text = newTask;
    taskBeingEdited.priority = editPriority.value;
    taskBeingEdited.dueDate = editDueDate.value;

    saveTasks();
    renderTasks();

    editForm.style.display = "none";
    taskBeingEdited = null;

    alert("Task updated successfully!");
});


cancelEditBtn.addEventListener("click", function() {
    editForm.style.display = "none";
    taskBeingEdited = null;
});
