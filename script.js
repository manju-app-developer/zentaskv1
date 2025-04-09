// Firebase Authentication Check
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadTasks(user.uid);
  }
});

// Load and Render Tasks
function loadTasks(uid) {
  const db = firebase.firestore();
  const tasksContainer = document.getElementById("tasks-container");

  db.collection("tasks")
    .where("uid", "==", uid)
    .orderBy("dueDate", "asc")
    .onSnapshot(snapshot => {
      tasksContainer.innerHTML = "";

      if (snapshot.empty) {
        tasksContainer.innerHTML = '<p class="text-gray-500 text-sm text-center mt-4">No tasks yet. Tap + to add one!</p>';
        return;
      }

      snapshot.forEach(doc => {
        const task = doc.data();
        const taskId = doc.id;
        const taskElement = createTaskCard(task, taskId);
        tasksContainer.appendChild(taskElement);
      });
    });
}

// Create Task Card UI
function createTaskCard(task, taskId) {
  const taskEl = document.createElement("div");
  taskEl.className = "bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col transition hover:shadow-md";

  taskEl.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-semibold text-lg">${task.title}</h3>
      <span class="text-xs text-gray-400">${new Date(task.dueDate).toLocaleDateString()}</span>
    </div>
    <p class="text-gray-600 text-sm">${task.description}</p>
    <div class="text-sm mt-2 text-gray-500">Priority: <span class="font-medium">${task.priority || 'Normal'}</span></div>
    <div class="flex justify-end gap-3 mt-3">
      <button onclick="deleteTask('${taskId}')" class="text-red-500 text-sm hover:underline">Delete</button>
    </div>
  `;

  return taskEl;
}

// Open Add Task Popup
function openAddPopup() {
  document.getElementById("add-task-popup").classList.remove("hidden");
}

// Close Add Task Popup
function closeAddPopup() {
  document.getElementById("add-task-popup").classList.add("hidden");
  clearTaskInputs();
}

// Add Task to Firestore
function addTask() {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-desc").value.trim();
  const dueDate = document.getElementById("task-deadline").value;

  if (!title || !dueDate) {
    alert("Please enter a title and deadline.");
    return;
  }

  const uid = firebase.auth().currentUser.uid;

  firebase.firestore().collection("tasks").add({
    uid,
    title,
    description,
    dueDate: new Date(dueDate).toISOString(),
    createdAt: new Date().toISOString(),
    priority: "Normal",
  }).then(() => {
    closeAddPopup();
  }).catch(error => {
    console.error("Error adding task:", error);
    alert("Something went wrong. Please try again.");
  });
}

// Clear input fields
function clearTaskInputs() {
  document.getElementById("task-title").value = "";
  document.getElementById("task-desc").value = "";
  document.getElementById("task-deadline").value = "";
}

// Delete Task
function deleteTask(taskId) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  firebase.firestore().collection("tasks").doc(taskId).delete().catch(error => {
    console.error("Error deleting task:", error);
    alert("Couldn't delete task. Please try again.");
  });
          }
