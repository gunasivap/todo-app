// clock script

function clockTrigger() {
    const time = new Date();
    document.querySelector("#clock").innerHTML = time.toLocaleTimeString();
}

setInterval(clockTrigger, 1000);


// calender script

const today = new Date()
let currentMonth = today.getMonth()
let currentYear = today.getFullYear()
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const nextBtn = document.querySelector("#next")
const prevBtn = document.querySelector("#previous")
const monthSelect = document.querySelector("#month")
const yearSelect = document.querySelector("#year")

// create goto select options 
function createMonths() {
    for (let i = 0; i < months.length; i++) {
        const option = document.createElement("option")
        option.value = i
        option.innerHTML = months[i]
        monthSelect.appendChild(option)
    }
}

function createYear() {
    for (let i = 1990; i < 2031; i++) {
        const option = document.createElement("option")
        option.value = i
        option.innerHTML = i
        yearSelect.appendChild(option)
    }
}

// render full calendar
const calendarBody = document.querySelector("#calendar-body")

function renderCalendar(month, year) {
    const firstDay = (new Date(year, month)).getDay()
    const daysInMonth = 32 - new Date(year, month, 32).getDate()

    // clearing all previous cells
    calendarBody.innerHTML = ""

    // filing up calendar header
    monthSelect.value = month
    yearSelect.value = year

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        const row = document.createElement("tr");

        //creating individual cells, filing them up with date
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                const cell = document.createElement("td")
                row.appendChild(cell)

            } else if (date > daysInMonth) {
                break

            } else {
                const cell = document.createElement("td")
                cell.dataset.dateId = date
                cell.innerHTML = date
                cell.classList.add("day")
                if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    cell.classList.add("today")
                }
                row.appendChild(cell)
                date++
            }
        }
        calendarBody.appendChild(row)
    }
}

// change calendar date
nextBtn.onclick = () => next()
prevBtn.onclick = () => previous()
monthSelect.onchange = () => jump()
yearSelect.onchange = () => jump()

function next() {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear
    currentMonth = (currentMonth + 1) % 12
    renderCalendar(currentMonth, currentYear)

    changeDayTask(1)
}

function previous() {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1
    renderCalendar(currentMonth, currentYear)

    changeDayTask(1)
}

function jump() {
    currentMonth = parseInt(monthSelect.value)
    currentYear = parseInt(yearSelect.value)
    renderCalendar(currentMonth, currentYear)

    changeDayTask(1)
}

// initial call for calendar
createMonths()
createYear()
renderCalendar(currentMonth, currentYear)


// tasks script

// retrive stored data or assign new object
const storedTasks = JSON.parse(localStorage.getItem("storedTasks"))
const myTasks = storedTasks || {}

// render task list
const taskContainer = document.querySelector("#task-container")
const taskTemplate = document.querySelector("#task-template")
const taskCount = document.querySelector("#task-count")

function renderTaskCount(x, y) {
    taskCount.innerHTML = `(${x}/${y})`
    console.log(myTasks)
}

function renderTaskList() {
    taskContainer.innerHTML = ""
    let tasks = myTasks[dayId]
    let total = (myTasks[dayId]) ? Object.keys(tasks).length : 0
    let completed = 0

    if (!total) {
        const noTask = document.createElement("li")
        noTask.classList.add("no-task")
        noTask.innerHTML = "0 Task"
        taskContainer.appendChild(noTask)

    } else {

        for (let taskObj in tasks) {
            const taskClone = taskTemplate.content.cloneNode(true)
            const taskEl = taskClone.querySelector(".task-li")
            const taskStatus = taskClone.querySelector(".status")
            const task = taskClone.querySelector(".task")

            const tempBool = tasks[taskObj].status === "incomplete"
            const classVal = (tempBool) ? "fa-circle-thin" : "fa-check-circle"
            completed = (tempBool) ? completed : completed + 1

            taskEl.dataset.taskId = taskObj
            taskEl.dataset.taskStatus = tasks[taskObj].status
            taskStatus.classList.add(classVal)
            task.innerHTML = tasks[taskObj].task

            taskContainer.appendChild(taskClone)
        }

    }
    renderTaskCount(completed, total)
}

function saveTasks() {
    localStorage.setItem("storedTasks", JSON.stringify(myTasks))
}

function saveAndRender() {
    saveTasks()
    renderTaskList()
}

// manage tasks
taskContainer.addEventListener("click", e => manageTasks(e))

function manageTasks(e) {
    if (e.target.classList.contains("check")) {
        const taskId = e.target.parentNode.parentNode.dataset.taskId
        const tempBool = myTasks[dayId][taskId].status === "incomplete"
        const statusVal = (tempBool) ? "complete" : "incomplete"
        myTasks[dayId][taskId].status = statusVal

        saveAndRender()
    } else if (e.target.classList.contains("fa-edit")) {
        taskId = e.target.parentNode.parentNode.dataset.taskId
        taskInput.value = myTasks[dayId][taskId].task
        taskInput.focus()

    } else if (e.target.classList.contains("fa-trash")) {
        const taskId = e.target.parentNode.parentNode.dataset.taskId
        delete myTasks[dayId][taskId]

        saveAndRender()
    }
}

// adding task when form submit
const taskForm = document.querySelector("#task-form")
taskForm.onsubmit = (e) => {
    e.preventDefault()
    addTasks()
}

var taskId
const taskInput = document.querySelector("#task-input")

function addTasks() {
    const taskValue = taskInput.value
    if (taskValue === "") {
        alert("please input something")
        return
    }

    myTasks[dayId] = myTasks[dayId] || {}
    taskId = taskId || new Date().getTime()

    myTasks[dayId][taskId] = {
        "task": taskValue,
        "status": (myTasks[dayId][taskId]) ? myTasks[dayId][taskId].status : "incomplete"
    }

    taskInput.value = ""
    taskId = undefined

    saveAndRender()
    taskContainer.scrollBy(0, 100);
}

// change selected day and task
var selectedDay
var dayId

calendarBody.addEventListener("click", e => {
    if (e.target.classList.contains("day")) {
        selectedDay = e.target.dataset.dateId
        changeDayTask(selectedDay)
    }
})

function changeDayTask(day) {
    // clear active cell
    const days = document.querySelectorAll(".day")
    days.forEach(day => {
        day.className = day.className.replace("active", "")
    })

    const dayEl = document.querySelector(`[data-date-id='${day}']`)
    dayEl.classList.add("active")

    // intiateTasksList
    const currentDay = parseInt(day)
    dayId = new Date(currentYear, currentMonth, currentDay).getTime()
    
    renderTaskList()
}

// initial call for tasks
selectedDay = today.getDate()
changeDayTask(selectedDay)

const prevDay = document.querySelector("#prev-day")
const nextDay = document.querySelector("#next-day")
prevDay.onclick = () => changeDayTask(selectedDay = selectedDay - 1)
nextDay.onclick = () => changeDayTask(selectedDay = selectedDay + 1)