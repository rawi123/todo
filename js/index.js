const createTask = document.querySelector("#create-task"),
    taskName = document.querySelector("#task-name"),
    deatils = document.querySelector("#deatils"),
    startDate = document.querySelector("#start-date"),
    startTime = document.querySelector("#start-appt"),
    endDate = document.querySelector("#end-date"),
    endtime = document.querySelector("#end-appt"),
    taskContainer = document.querySelector(".task-container"),
    addTask = document.querySelector("#add-task"),
    tasks = document.querySelector(".tasks"),
    exit = document.querySelector(".exit"),
    deleteAllTasksContainer = document.querySelector(".delete-all"),
    deleteAllTasks = document.querySelector(".fa-calendar-times"),
    recoverLast = document.querySelector(".fa-undo");
if (!localStorage.getItem("id")) {
    localStorage.setItem("id", 0)
    localStorage.setItem("tasks", JSON.stringify([]))
    localStorage.setItem("recover", JSON.stringify([]))
}

const tasksStorage = JSON.parse(localStorage.getItem("tasks")),
    recoverStorage = JSON.parse(localStorage.getItem("recover"))
let taskToDelete;

function displayAllTasks() {
    for (const singleTask of tasksStorage) {
        buildTaskHtml(singleTask, false)
    }
    sortTasks()
}

function dateLegalisation() {
    const today = new Date(),
        day = today.getDate(),
        month = today.getMonth() + 1, //January is 0!
        year = today.getFullYear();
    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = '0' + month;
    }

    todayDate = year + '-' + month + '-' + day;
    startDate.setAttribute("min", todayDate);
    endDate.setAttribute("min", todayDate);
}

function deleteAll() {
    recoverStorage.push(...tasksStorage)
    tasksStorage.length = 0;
    updateLocalStorage();
    [...tasks.children].map(val => {
        if (val !== deleteAllTasksContainer)
            val.remove()
    })
}

function addListners() {
    createTask.addEventListener("click", createTaskFunc)
    startDate.addEventListener("blur", checkEndDate)
    addTask.addEventListener("click", taskAddComplete)
    exit.addEventListener("click", createTaskFunc)
    deleteAllTasks.addEventListener("click", deleteAll)
    recoverLast.addEventListener("click", recoverLastTask)
}

function recoverLastTask() {
    if (recoverStorage.length > 0) {
        const recover = recoverStorage.pop()
        tasksStorage.push(recover)
        buildTaskHtml(recover)
    }
    updateLocalStorage()
}

function checkEndDate() {//set date min to be as start date and if clicked on end date changed it then went to start check validation
    let startBiggerThanEnd = false;
    endDate.setAttribute("min", startDate.value)

    if (endDate.value.length === 0 && endtime.value.length > 0) {
        line(endDate, "red")
        return false
    }
    if (endDate.value.length > 0) {
        if (returnSlicedNumber(endDate.value, 0, 4) < returnSlicedNumber(startDate.value, 0, 4)) {
            startBiggerThanEnd = true
        }
        else if (returnSlicedNumber(endDate.value, 5, 7) < returnSlicedNumber(startDate.value, 5, 7)) {
            startBiggerThanEnd = true
        }
        else if (returnSlicedNumber(endDate.value, 8, 10) < returnSlicedNumber(startDate.value, 8, 10)) {
            startBiggerThanEnd = true
        }
        else if (startTime.value.length > 0 && startDate.value === endDate.value) {
            if (returnSlicedNumber(endtime.value, 0, 2) < returnSlicedNumber(startTime.value, 0, 2)) {
                startBiggerThanEnd = true
            }
            else if ((returnSlicedNumber(endtime.value, 0, 2) === returnSlicedNumber(startTime.value, 0, 2))
                && (returnSlicedNumber(endtime.value, 3, 5) <= returnSlicedNumber(startTime.value, 3, 5))) {
                startBiggerThanEnd = true;
            }
        }
        if (startBiggerThanEnd) {
            endDate.value = startDate.value
            endtime.value = startTime.value
            line(endDate, "red")
            line(endtime, "red")
            return false;
        }
    }
    return true;
}
function returnSlicedNumber(elem, from, to) {
    return Number(elem.slice(from, to))
}

function createTaskFunc() {
    taskContainer.classList.toggle("task-container-change")
}

function taskAddComplete() {
    if (checkEndDate() && checkInputValidation()) {
        const obj = createObjectFromForm()
        tasksStorage.push(obj)
        updateLocalStorage()
        addTaskToContainer(obj)
        createTaskFunc()
    }
}

function createObjectFromForm() {
    const obj = {
        id: localStorage.getItem("id"),
        taskName: taskName.value,
        startDate: startDate.value,
    }
    if (startTime.value) {
        obj.startTime = startTime.value
    }
    if (deatils.value) {
        obj.deatils = deatils.value
    }
    if (endDate.value) {
        obj.endDate = endDate.value
    }
    if (endtime.value) {
        obj.endtime = endtime.value
    }
    return obj;
}

function addTaskToContainer(obj) {//object is the task object
    buildTaskHtml(obj)
}

function checkInputValidation() {
    if (taskName.value.length === 0 || startDate.value.length === 0) {
        line((taskName.value.length === 0 ? taskName : startDate), "red")
        return false
    }
    return true;
}

function updateLocalStorage(addId = true) {
    if (addId) {
        localStorage.setItem("id", Number(localStorage.getItem("id")) + 1)
    }
    localStorage.setItem("tasks", JSON.stringify(tasksStorage))
    localStorage.setItem("recover", JSON.stringify(recoverStorage))
}

async function line(elem, color) {
    elem.style.outline = `3px solid ${color}`
    await new Promise((res, rej) => {
        setTimeout(() => {
            elem.style.outline = "1px solid black"
            res()
        }, 1600);
    })
}

function createFirstLine(taskNameDiv, deleteActiveDiv, obj) {
    const h2 = document.createElement("h2"),
        permDel = document.createElement("div"),
        active = document.createElement("div"),
        deleteTask = document.createElement("div");

    h2.innerText = "Task name: " + obj.taskName

    permDel.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`
    deleteTask.innerHTML = `<i class="fas fa-trash-alt"></i>`
    active.innerHTML = `<i class="far fa-check-circle"></i>`

    deleteActiveDiv.append(active, deleteTask, permDel)
    deleteActiveDiv.style.display = "flex"
    active.addEventListener("click", missionDone)
    deleteTask.addEventListener("click", function () {
        taskToDelete = obj;
        deleteThisTask(this)
    })
    permDel.addEventListener("click", function () {
        taskToDelete = obj;
        deletePerm(this)
    })

    taskNameDiv.append(h2, deleteActiveDiv)
}

function buildTaskHtml(obj, order = true) {

    const div = document.createElement("div"),
        taskNameDiv = document.createElement("div"),
        otherDiv = document.createElement("div"),
        deleteActiveDiv = document.createElement("div"),
        startDiv = document.createElement("div"),
        endDiv = document.createElement("div"),
        arr = [];

    createFirstLine(taskNameDiv, deleteActiveDiv, obj)


    if (obj.deatils) {
        arr.push(createSingleElemenet("h3", ("details: " + obj.deatils)))
    }
    if (obj.startTime) {
        startDiv.append(createSingleElemenet("h3", ("Start Time: " + obj.startTime)))
    }

    startDiv.append(createSingleElemenet("h3", ("Start Date: " + obj.startDate)))

    if (obj.endtime) {
        endDiv.append(createSingleElemenet("h3", ("End Time:" + obj.endtime)))
    }

    if (obj.endDate) {
        endDiv.append(createSingleElemenet("h3", ("End Date: " + obj.endDate)))
    }
    
    arr.push(startDiv, endDiv)

    otherDiv.append(...arr)
    div.classList.add("task")
    div.append(taskNameDiv, otherDiv)
    tasks.append(div)
    div.dataset.id = obj.id

    if (order) {
        sortTasks()
        line(div, "green")
    }

}

function deletePerm(item) {
    console.log(123);
    item.parentElement.parentElement.parentElement.remove()
    tasksStorage.splice(tasksStorage.indexOf(taskToDelete), 1)
    updateLocalStorage(false)
}

function sortTasks() {
    tasksStorage.sort((a, b) => {
        if (b.startDate > a.startDate) {
            return 1
        }
        return -1
    })

    let len = tasksStorage.length;
    tasksStorage.map(val => {
        const item = document.querySelector(`[data-id="${val.id}"]`);
        item.style.order = len;
        len--;
    })
}

function missionDone() {
    this.innerHTML = this.innerHTML == `<i class="fas fa-check-circle" aria-hidden="true"></i>` ? `<i class="far fa-check-circle"></i>` : `<i class="fas fa-check-circle"></i>`
    this.parentElement.parentElement.parentElement.classList.toggle("line-throw")
}

function deleteThisTask(item) {
    item.parentElement.parentElement.parentElement.remove()
    tasksStorage.splice(tasksStorage.indexOf(taskToDelete), 1)
    recoverStorage.push(taskToDelete)
    updateLocalStorage(false)
}

function createSingleElemenet(type, text) {
    const elem = document.createElement(type)
    elem.innerText = text
    return elem
}
displayAllTasks()
dateLegalisation()
addListners()


