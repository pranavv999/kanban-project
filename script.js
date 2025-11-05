// GET DOM ELEMENTS
const COLORS = ["lightpink", "lightgreen", "lightblue", "lightgrey"];


const taskSection = document.getElementById('tasks');

const openModal = document.querySelector(".left-img");
const modalParent = document.querySelector(".modal-container");
const modalClose = document.querySelector(".modal-btn");
const deleteIcon = document.querySelector(".right-img");

const addTaskButton = document.getElementById("add-task");
const textArea = document.getElementsByTagName("textarea")[0];

const taskCards = document.getElementsByClassName("card-container");

const filters = document.querySelectorAll("#filter-sec .filter");
const priorityColors = document.querySelectorAll(".priority .filter");
// const ticketLocks = document.getElementsByClassName("lock-cont");
// const colorRibbon = document.getElementsByClassName("color-code");

let TASKS = {}

if(localStorage.getItem("tasks")){
    TASKS = getTasks();

    for(const key in TASKS){
        
        addTaskToDom(TASKS[key]['taskID'],TASKS[key]['taskTitle'],TASKS[key]['taskColor']);
    }
}

// EVENT LISTNERS


// -------------------- MODAL EVENTS --------------------

// Open Modal to add Task
openModal.addEventListener("click", function () {
    modalParent.style.display = "flex";
    // Disable overflow
    document.body.style.overflow = "hidden";
});

// Event on Add Task Button
addTaskButton.addEventListener("click", addTaskHandler);

function addTaskHandler(e) {
    // task title
    const taskTitle = textArea.value; // Get user Entered Value

    // Handle Empty input value
    if (!taskTitle) {
        window.alert("Please enter valid task !");
        return;
    }

    const ticketId = generateUID(); // generate unique ID

    // get selected Color
    let selectedColor = "lightpink";
    for (let pColor of priorityColors) {
        if (pColor.classList.length == 3) {
            selectedColor = getColorPart(pColor.classList[1]);
        }
    }

    // add Task here
    addTaskToDom(ticketId, taskTitle, selectedColor);
    //  add task to localstorage

    // close the modal - will do cleanup here
    modalCloseHandler();
}

function addTaskToDom(taskID, taskTitle, taskColor) {
    const cContainer = document.createElement("div");
    cContainer.classList.add("card-container");

    cContainer.innerHTML = `
            <div class="color-code color-code-${taskColor}"></div>
            <div class="details">
                <h3 class="task-title">${taskTitle}</h3>
                <div class="task-id light-text">
                    <span>Task ID: </span>
                    <span class="main-task-id">${taskID}</span>
                </div>
                <div class="lock-cont">
                    <i class="fi fi-sr-lock"></i>
                </div>
            </div>
        </div>
    `;

    taskSection.appendChild(cContainer);
    cContainer.addEventListener("click", handleCardClick);
    lockEventAdd(cContainer);
    changeColorAdd(cContainer);
    addNewTask(taskID, taskTitle, taskColor)
}

// Closes modal - on clicking corss
modalClose.addEventListener("click", modalCloseHandler);

function modalCloseHandler() {
    // clean the text area
    textArea.value = "";
    // reset the color
    colorSelectionHandler(priorityColors[0], "active-color", priorityColors);

    // close the modal
    modalParent.style.display = "none";
    // Enable overflow
    document.body.style.overflow = "visible";
}
// -------------------- MODAL EVENTS --------------------


// -------------------- Delete Button --------------------
deleteIcon.addEventListener("click", function (e) {
    e.currentTarget.classList.toggle("delete-active");
});
// -------------------- Delete Button --------------------



// -------------------- Card click handler for Delete --------------------
function handleCardClick(e) {
    if (deleteIcon.classList.contains("delete-active")) {
        const taskID = e.currentTarget.querySelector(".main-task-id").innerText;
        deleteTasks(taskID);
        e.currentTarget.remove();
    }
}
// -------------------- Card click handler for Delete --------------------

// add selection Modal Priority Colors
for (let mcolor of priorityColors) {
    mcolor.addEventListener("click", function (e) {
        colorSelectionHandler(e.currentTarget, "active-color", priorityColors);
    });
}

// Add Filter Event - to filter tasks by color
for (let filter of filters) {
    filter.addEventListener("click", function (e) {
        colorSelectionHandler(e.currentTarget, "active-filter", filters);
        filterCards(filter.classList[1]);
    });
}

function colorSelectionHandler(targetElement, classToAdd, colorsArray) {
    for (let filt of colorsArray) {
        filt.classList.remove(classToAdd);
    }
    targetElement.classList.add(classToAdd);
}

function filterCards(filterColor) {
    for (let card of taskCards) {
        const cardColor = getColorPart(card.children[0].classList[1]);
        if (filterColor == "all" || filterColor == cardColor) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    }
}


// -------------------- ticket lock handler --------------------
function lockEventAdd(task) {
    const lockParent = task.querySelector(".lock-cont");
    lockParent.addEventListener("click", lockHandler);
}

function lockHandler(e) {
    // if lock then unlock
    const parent = e.target.parentElement;
    const mainParent = parent.parentElement;
    
    const taskTitle = mainParent.querySelector(".task-title");

    if (e.target.classList.contains("fi-sr-lock")) {
        e.target.classList.remove("fi-sr-lock");
        e.target.classList.add("fi-sr-lock-open-alt");
        taskTitle.setAttribute("contenteditable", "true");
    } else {
        // if unlock then lock
        const updatedTitle = mainParent.querySelector(".task-title");
        const tktID = mainParent.querySelector('.main-task-id');

        updateTitle(tktID.innerText, updatedTitle.innerText);
        e.target.classList.remove("fi-sr-lock-open-alt");
        e.target.classList.add("fi-sr-lock");
        taskTitle.setAttribute("contenteditable", "false");
    }
}
// -------------------- ticket lock handler --------------------



// -------------------- change Task Ribbon Colors --------------------
function changeColorAdd(task){
    const ribbon = task.querySelector(".color-code");
    ribbon.addEventListener("click", changeColorHandler)
}
function changeColorHandler(e) {
    const ribbonParent = e.target.parentElement;
    const taskId = ribbonParent.querySelector(".main-task-id").innerText;
    
    
    
    const currClass = e.target.classList[1];
    const colorCode = getColorPart(currClass);

    const currIndex = COLORS.indexOf(colorCode);
    const nextIndex = (currIndex + 1) % COLORS.length;
    const nextClass = `color-code-${COLORS[nextIndex]}`;
    // update color in local storage
    updateColor(taskId, COLORS[nextIndex]);

    e.target.classList.remove(currClass);
    e.target.classList.add(nextClass);
}
// -------------------- change Task Ribbon Colors --------------------


// -------------------- UTIL FUNCTIONS --------------------

// UUID function
function generateUID() {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return "#T-" + firstPart + secondPart;
}

// Process String
function getColorPart(className) {
    const splitArray = className.split("-");
    return splitArray[splitArray.length - 1];
}

// Update Tasks
function addNewTask(taskID, taskTitle, taskColor){
    TASKS[taskID] = {
        taskID, taskTitle, taskColor
    }
    updateTasks();
}

function updateTasks(){
    localStorage.setItem("tasks", JSON.stringify(TASKS));
}

function updateTitle(taskID, taskTitle){
    TASKS[taskID]['taskTitle'] = taskTitle;
    localStorage.setItem("tasks", JSON.stringify(TASKS));
}
function updateColor(taskID, taskColor){
    TASKS[taskID]['taskColor'] = taskColor;
    localStorage.setItem("tasks", JSON.stringify(TASKS));
}

function getTasks(){
    if(localStorage.getItem("tasks")){
        return JSON.parse(localStorage.getItem("tasks"));
    }
    return {}
}

function deleteTasks(taskID){
    console.log(taskID);
    console.log(TASKS[taskID]);
    
    delete TASKS[taskID];
    updateTasks();
}
// -------------------- UTIL FUNCTIONS --------------------
