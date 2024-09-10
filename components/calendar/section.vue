<script setup lang="ts">

const emit = defineEmits(['taskEdit', 'onDraggedTaskChange', 'inactiveTaskEdit']);

defineExpose({
    mouseMoveEvent, mouseUpEvent, onEditTask
});

const props = defineProps({
    columnWidth: Number,
    datesPos: Number,
    calendarDragPos: Number,
    profile: Object as PropType<Profile>
});

const prps = toRef(props);
const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });
const dayTimestamp = 86400000;
const taskIntervals: Map<string, TaskTimestampInterval>[] = [new Map<string, TaskTimestampInterval>, new Map<string, TaskTimestampInterval>, new Map<string, TaskTimestampInterval>];

let rows: Ref<Task[]> = ref([[], [], []]);
let pending: boolean = true;
let mouseButtonDown: boolean = false;
let selectedTask: Task;
let inactiveTask = ref();
let differenceOfDays: number;

let startDragPosX: number;
let draggedTaskObject = ref();
let clickOffsetX: number;
let clickOffsetY: number;
let currentHoveredRow: number;
let editing: boolean = false;
let changedTasks: Task[] = [];

enum DragStatus {
    None, TaskCreate, TaskDrag, TaskLeftResize, TaskRightResize
}

let dragStatus: DragStatus = DragStatus.None;


// database functions

// do this in index for each section and then passing it through props
await useFetch('/api/tasks/tasksList', { method: 'post' })!.then((value) => {
    pending = false; 
    let tasks = value.data.value as Task[];

    let maxRow: number = 2;
    tasks.forEach((task) => { if(task.row > maxRow) { maxRow = task.row }});

    for(let i = 3; i < maxRow + 1; i++)
    {
        rows.value.push([]);
        taskIntervals.push(new Map<string, TaskTimestampInterval>);
    }

    tasks.forEach((task: Task) => {
        rows.value[task.row].push(task);
        taskIntervals[task.row].set(
            task.uuid,
            { 
                from: new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day).getTime(), 
                to: new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day).getTime() 
            }
        );
        
    });
});

async function addTask(task: Task) { 
    const data = await $fetch('/api/tasks/tasksCreate', {
        method: 'post',
        body: {
            color: task.color,
            name: task.name,
            row: task.row,
            status: task.status,
            fromDate: task.fromDate,
            toDate: task.toDate,
            createdBy: task.createdBy,
            assignees: task.assignees,
            description: task.description
        }
    });

    return data;
}

async function saveTask(task: Task) {
    $fetch('/api/tasks/tasksEdit', {
        method: 'post',
        body: { 
            uuid: task.uuid,
            color: task.color,
            name: task.name,
            row: task.row,
            status: task.status,
            fromDate: task.fromDate,
            toDate: task.toDate,
            assignees: task.assignees,
            description: task.description,
            createdBy: task.createdBy
        }
    });
}

//


// helper functions

function CDateToDate(date: CDate) {
    return new Date(date.year, date.month - 1, date.day);
}

function CDateToTimestamp(date: CDate) {
    return CDateToDate(date).getTime();
}

function invalidRow(row: number, currentUUID: string, fromDate: CDate, toDate: CDate) {
    let returnValue = false;
    if (!taskIntervals[row])
        return returnValue;

    const fromTimeTimestamp = CDateToDate(fromDate).getTime();
    const toTimeTimestamp = CDateToDate(toDate).getTime();
    taskIntervals[row].forEach((value: TaskTimestampInterval, key: string) => {
        if(key == currentUUID)
            return;
        
        if ((fromTimeTimestamp >= value.from && fromTimeTimestamp <= value.to) || (toTimeTimestamp <= value.to && toTimeTimestamp >= value.from) || (fromTimeTimestamp <= value.from && toTimeTimestamp >= value.to)) {
            returnValue = true;
        }
    });

    return returnValue;
}

function invalidRowIgnoreUUIDs(row: number, currentUUIDs: string[], fromDate: CDate, toDate: CDate) {
    let returnValue = false;
    if (!taskIntervals[row]) 
        return returnValue;    

    const fromTimeTimestamp = CDateToDate(fromDate).getTime();
    const toTimeTimestamp = CDateToDate(toDate).getTime();
    taskIntervals[row].forEach((value: TaskTimestampInterval, key: string) => {
        if(currentUUIDs.includes(key)) {
            return;
        }
        
        if ((fromTimeTimestamp >= value.from && fromTimeTimestamp <= value.to) || (toTimeTimestamp <= value.to && toTimeTimestamp >= value.from) || (fromTimeTimestamp <= value.from && toTimeTimestamp >= value.to)) {
            returnValue = true;
        }
    });

    return returnValue;
}

function findTasksInRow(row: number, fromDate: CDate, toDate: CDate) {
    let returnValue: string[] = []
    if (!taskIntervals[row])
        return returnValue;

    const fromTimeTimestamp = CDateToDate(fromDate).getTime();
    const toTimeTimestamp = CDateToDate(toDate).getTime();
    taskIntervals[row].forEach((value: TaskTimestampInterval, key: string) => {
        if ((fromTimeTimestamp >= value.from && fromTimeTimestamp <= value.to) || (toTimeTimestamp <= value.to && toTimeTimestamp >= value.from) || (fromTimeTimestamp <= value.from && toTimeTimestamp >= value.to)) {
            returnValue.push(key);
        }
    });

    return returnValue;
}

function findTaskByUUID(row: number, uuid: string) {
    let foundTask: Task = undefined;
    rows.value[row].forEach((task: Task) => {
        if(task.uuid === uuid) 
            foundTask = task;        
    });

    return foundTask;
}

function changeRow(uuid: string, row1: number, row2: number) {
    let foundTask: Task;
    rows.value[row1].forEach((task: Task, index: number) => {
        if(task.uuid === uuid) {
            foundTask = task;
            rows.value[row1].splice(index, 1);            
        }
    });

    rows.value[row2].push(foundTask);
}

function fixRow(task: Task, ignoreUUIDs: string[] = [], fromDate: CDate = undefined, toDate: CDate = undefined) {
    let tempFromDate: CDate = fromDate ? fromDate : task.fromDate;
    let tempToDate: CDate = toDate ? toDate : task.toDate;

    while(task.row - 1 >= 0 && (!invalidRow(task.row - 1, task.uuid, tempFromDate, tempToDate) || !invalidRowIgnoreUUIDs(task.row - 1, ignoreUUIDs, tempFromDate, tempToDate))) {
        changeRow(task.uuid, task.row, task.row - 1);
        taskIntervals[task.row].delete(task.uuid);
        taskIntervals[task.row - 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
        task.row = task.row - 1; 
        
        for(let i = Math.max(task.row, 1); i < rows.value.length; i++) {
            if(invalidRow(i, task.uuid, tempFromDate, tempToDate)) {
                findTasksInRow(i, tempFromDate, tempToDate).forEach((taskUUID) => {
                    let newTask: Task = findTaskByUUID(i, taskUUID);
                    
                    if(task) { 
                        tempFromDate = CDateToTimestamp(newTask.fromDate) < CDateToTimestamp(tempFromDate) ? newTask.fromDate : tempFromDate;
                        tempToDate = CDateToTimestamp(newTask.toDate) > CDateToTimestamp(tempToDate) ? newTask.toDate : tempToDate;

                        changeRow(newTask.uuid, i, i - 1);
                        taskIntervals[i].delete(newTask.uuid);
                        taskIntervals[i - 1].set(newTask.uuid, { from: CDateToDate(newTask.fromDate).getTime(), to: CDateToDate(newTask.toDate).getTime() });
                        newTask.row = i - 1;                     
                    }
                })
            } else break;
        }        
    }
}

function getDifferenceOfDays(fromDate: CDate, toDate: CDate) {
    const fdate = CDateToDate(fromDate);
    const tdate = CDateToDate(toDate);

    return (tdate.getTime() - fdate.getTime()) / dayTimestamp;
}

function changeDays(date: CDate, value: number) {
    const newDate = CDateToDate(date);
    newDate.setDate(newDate.getDate() + value);

    return {
        day: newDate.getDate(),
        month: newDate.getMonth() + 1,
        year: newDate.getFullYear()
    }
}

function taskPlacementPos(task: Task) {
    const todayDayTimestamp = Math.floor(new Date().getTime() / 86400000);
    const taskStartDayTimestamp = Math.floor(new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day).getTime() / 86400000) + 4;
    const taskEndDayTimestamp = Math.floor(new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day).getTime() / 86400000) + 4 + 1;
    
    const taskLength = taskEndDayTimestamp - taskStartDayTimestamp;
    const timeFromToday = taskStartDayTimestamp - todayDayTimestamp;

    return { from: timeFromToday, to: timeFromToday + taskLength, taskLength };    
}

function inactiveTaskPlacementPos(task: InactiveTask) {
    const todayDayTimestamp = Math.floor(new Date().getTime() / 86400000);
    const taskStartDayTimestamp = Math.floor(new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day).getTime() / 86400000) + 4;
    const taskEndDayTimestamp = Math.floor(new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day).getTime() / 86400000) + 4 + 1;
    
    const taskLength = taskEndDayTimestamp - taskStartDayTimestamp;
    const timeFromToday = taskStartDayTimestamp - todayDayTimestamp;

    return { from: timeFromToday, to: timeFromToday + taskLength, taskLength };    
}
//


// events

async function onEditTask(task: Task) {
    let i: number = -1;
    rows.value[task.row].forEach((_task: Task, index: number) => {
        if(task.uuid === _task.uuid)
            i = index;
    });

    rows.value[task.row][i] = task;
}

async function onRowChangeEvent(index: number) {
    currentHoveredRow = index;
}

async function mousePressedEvent(e: MouseEvent) {
    if (dragStatus !== DragStatus.None || e.button !== 0)
        return;

    if(editing) {
        editing = false;
        emit('taskEdit', undefined);
    }
    else {
        /*if(inactiveTask) 
            inactiveTask.value = {};*/         

        dragStatus = DragStatus.TaskCreate;
        mouseButtonDown = true;
        startDragPosX = e.pageX;
        const todayDate = new Date();
        const val = e.pageX / props.columnWidth! < 0 ? Math.ceil(e.pageX / props.columnWidth!) : Math.floor(e.pageX / props.columnWidth!)
        const currentDate = changeDays({ day: todayDate.getDate(), month: todayDate.getMonth() + 1, year: todayDate.getFullYear() }, val - props.datesPos! - 3); // TODO: investigate, is buggy

        /*inactiveTask.value = {
            row: -1,
            fromDate: currentDate,
            toDate: currentDate,
        };*/
        
        let newTask: Task = {
            uuid: "",
            color: "#977aff",
            name: "New",
            row: -1,
            status: "No status",
            fromDate: currentDate,
            toDate: currentDate,
            assignees: [],
            description: "",
            createdBy: ""
        };

        let row = -1;
        for (let i = 0; i < rows.value.length; i++) {
            if (!invalidRow(i, "", currentDate, currentDate)) {
                row = i;
                break;
            }
        }
        
        if(row === -1)
        {
            rows.value.push([]);
            taskIntervals.push(new Map<string, TaskTimestampInterval>);
            row = rows.value.length - 1;
        }

        newTask.row = row;
        // debugging
        differenceOfDays = getDifferenceOfDays(newTask.fromDate, newTask.toDate);
        newTask = await addTask(newTask);
        taskIntervals[row].set(newTask.uuid, { from: CDateToDate(newTask.fromDate).getTime(), to: CDateToDate(newTask.toDate).getTime() });
        rows.value[row].push(newTask);
        //
        emit('taskEdit', newTask);
        editing = true;
    }
}

async function startTaskDragging(e: MouseEvent, task: Task) {
    if (dragStatus !== DragStatus.None || e.button !== 0)
        return;

    mouseButtonDown = true;
    selectedTask = task;
    inactiveTask.value = undefined;
    dragStatus = DragStatus.TaskDrag;

    setTimeout(() => {
        if (mouseButtonDown) {
            draggedTaskObject.value = { uuid: selectedTask.uuid, name: selectedTask.name, status: selectedTask.status, color: selectedTask.color, width: taskPlacementPos(task).taskLength * props.columnWidth! };
            mouseButtonDown = false;
            clickOffsetX = e.offsetX;
            clickOffsetY = e.offsetY;
            startDragPosX = e.pageX;
            emit('onDraggedTaskChange', draggedTaskObject.value);
        }
        else {
            emit('taskEdit', selectedTask);
            editing = true;
        }        
    }, 100);
}

async function startTaskLeftResizeDragging(e: MouseEvent, task: Task) {
    selectedTask = task;
    dragStatus = DragStatus.TaskLeftResize;
    startDragPosX = e.pageX;
    mouseButtonDown = true;
}

async function startTaskRightResizeDragging(e: MouseEvent, task: Task) {
    selectedTask = task;
    dragStatus = DragStatus.TaskRightResize;
    startDragPosX = e.pageX;
    mouseButtonDown = true;
}

async function mouseMoveEvent(mousePageX: number, mousePageY: number) { // TODO: experiment with datespos for threshold
    switch(dragStatus) {
        /*case DragStatus.TaskCreate:
            if (startDragPosX - mousePageX! > 49 && differenceOfDays > 0) {
                inactiveTask.value.toDate = changeDays(inactiveTask.value.toDate, -1);
                startDragPosX = mousePageX!;
                differenceOfDays = getDifferenceOfDays(inactiveTask.value.fromDate, inactiveTask.value.toDate);
            } 
            else if (startDragPosX - mousePageX! < -49 && !invalidRow(inactiveTask.value.row, "", inactiveTask.value.fromDate, changeDays(inactiveTask.value.toDate, 1))) {
                inactiveTask.value.toDate = changeDays(inactiveTask.value.toDate, 1);
                startDragPosX = mousePageX!;
                differenceOfDays = getDifferenceOfDays(inactiveTask.value.fromDate, inactiveTask.value.toDate);
            }
            break;*/
        case DragStatus.TaskDrag: // TODO: add temporary row when out of bounds of rows
            if(!draggedTaskObject.value)
                return;
            
            draggedTaskObject.value.left = mousePageX - clickOffsetX;
            draggedTaskObject.value.top = mousePageY - clickOffsetY;

            let tempFromDate: CDate = selectedTask.fromDate;
            let tempToDate: CDate = selectedTask.toDate;

            if(invalidRow(selectedTask.row, selectedTask.uuid, selectedTask.fromDate, selectedTask.toDate) && selectedTask.row === currentHoveredRow) {
                let taskUUIDs: string[] = findTasksInRow(selectedTask.row, tempFromDate, tempToDate);
                let intersectedTask: Task;

                taskUUIDs.forEach((taskUUID) => {
                    if(taskUUID !== selectedTask.uuid)
                        intersectedTask = findTaskByUUID(selectedTask.row, taskUUID);
                });

                tempFromDate = intersectedTask.fromDate;
                tempToDate = intersectedTask.toDate;
                let alreadyChangedTaskUUIDs: string[] = [];

                for(let i = selectedTask.row + 1; i < rows.value.length; i++) {
                    let leave: boolean = !invalidRow(i + 1, selectedTask.uuid, tempFromDate, tempToDate);
                    
                    if(invalidRow(i, selectedTask.uuid, tempFromDate, tempToDate)) {
                        if(i === rows.value.length - 1) {
                            rows.value.push([]);
                            taskIntervals.push(new Map<string, TaskTimestampInterval>);
                        }

                        findTasksInRow(i, tempFromDate, tempToDate).forEach((taskUUID) => {
                            let task: Task = findTaskByUUID(i, taskUUID);
                            
                            if(task && !alreadyChangedTaskUUIDs.includes(task.uuid)) {
                                tempFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tempFromDate) ? task.fromDate : tempFromDate;
                                tempToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tempToDate) ? task.toDate : tempToDate;
                                changeRow(task.uuid, i, i + 1);
                                taskIntervals[i].delete(task.uuid);
                                taskIntervals[i + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                                task.row = i + 1;
                                alreadyChangedTaskUUIDs.push(task.uuid);
                            }
                        })
                    }

                    if(leave)
                        break;
                }
                
                taskUUIDs.forEach((taskUUID) => {
                    let task: Task = findTaskByUUID(selectedTask.row, taskUUID);                    
                    
                    if(task && task.uuid !== selectedTask.uuid) {
                        tempFromDate = task.fromDate;
                        tempToDate = task.toDate;
                    
                        changeRow(task.uuid, selectedTask.row, selectedTask.row + 1);
                        taskIntervals[selectedTask.row].delete(task.uuid);
                        taskIntervals[selectedTask.row + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                        task.row = selectedTask.row + 1;
                    }
                });
            }   
            else if(selectedTask.row !== 0 && !invalidRow(selectedTask.row - 1, selectedTask.uuid, tempFromDate, selectedTask.toDate)) {
                fixRow(selectedTask);
            }
            else if(currentHoveredRow != selectedTask.row && currentHoveredRow != rows.value.length) {
                if(!invalidRow(currentHoveredRow, selectedTask.uuid, selectedTask.fromDate, selectedTask.toDate)) {
                    let nextAvailableRow: number = -1;
                    
                    for(let i = currentHoveredRow - 1; i >= 0; i--) {
                        if(invalidRow(i, selectedTask.uuid, selectedTask.fromDate, selectedTask.toDate)) {
                            nextAvailableRow = i + 1;
                            break;
                        }
                    }

                    if(nextAvailableRow === -1 && (selectedTask.row === 0 || currentHoveredRow === 0))
                        nextAvailableRow = 0;
                    
                    let tasksInUpperRow: Task[] = [];
                    let taskUUIDs: string[] = [];
                    findTasksInRow(selectedTask.row + 1, selectedTask.fromDate, selectedTask.toDate).forEach((taskUUID) => {
                        let task: Task = findTaskByUUID(selectedTask.row + 1, taskUUID);

                        if(task) {
                            tempFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tempFromDate) ? task.fromDate : tempFromDate;
                            tempToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tempToDate) ? task.toDate : tempToDate;
                            
                            tasksInUpperRow.push(task);
                            taskUUIDs.push(taskUUID);
                        }
                    });
                    
                    taskUUIDs.push(selectedTask.uuid);

                    changeRow(selectedTask.uuid, selectedTask.row, nextAvailableRow);
                    taskIntervals[selectedTask.row].delete(selectedTask.uuid);
                    taskIntervals[nextAvailableRow].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });

                    let prevRow: number = selectedTask.row;
                    selectedTask.row = nextAvailableRow;

                    if(!invalidRow(prevRow, selectedTask.uuid, tempFromDate, tempToDate)) {
                        tasksInUpperRow.forEach((task) => {
                            fixRow(task, taskUUIDs, tempFromDate, tempToDate);
                        });
                    }
                }
                else {
                    let taskUUIDs: string[] = findTasksInRow(currentHoveredRow, tempFromDate, tempToDate);
                    let intersectedTask: Task = undefined;

                    taskUUIDs.forEach((taskUUID) => {
                        if(taskUUID !== selectedTask.uuid)
                            intersectedTask = findTaskByUUID(currentHoveredRow, taskUUID);
                    });

                    tempFromDate = intersectedTask.fromDate;
                    tempToDate = intersectedTask.toDate;
                    let alreadyChangedTaskUUIDs: string[] = [];

                    for(let i = currentHoveredRow + 1; i < rows.value.length; i++) {
                        let leave: boolean = !invalidRow(i + 1, selectedTask.uuid, tempFromDate, tempToDate);
                        
                        if(invalidRow(i, selectedTask.uuid, tempFromDate, tempToDate)) {
                            if(i === rows.value.length - 1) {
                                rows.value.push([]);
                                taskIntervals.push(new Map<string, TaskTimestampInterval>);
                            }

                            findTasksInRow(i, tempFromDate, tempToDate).forEach((taskUUID) => {
                                let task: Task = findTaskByUUID(i, taskUUID);
                                
                                if(task && !alreadyChangedTaskUUIDs.includes(task.uuid)) {
                                    tempFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tempFromDate) ? task.fromDate : tempFromDate;
                                    tempToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tempToDate) ? task.toDate : tempToDate;
                                    changeRow(task.uuid, i, i + 1);
                                    taskIntervals[i].delete(task.uuid);
                                    taskIntervals[i + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                                    task.row = i + 1;
                                    alreadyChangedTaskUUIDs.push(task.uuid);
                                }
                            })
                        }

                        if(leave)
                            break;
                    }
                    
                    taskUUIDs.forEach((taskUUID) => {
                        let task: Task = findTaskByUUID(currentHoveredRow, taskUUID);                    
                        
                        if(task && task.uuid !== selectedTask.uuid) {
                            tempFromDate = task.fromDate;
                            tempToDate = task.toDate;
                        
                            changeRow(task.uuid, currentHoveredRow, currentHoveredRow + 1);
                            taskIntervals[currentHoveredRow].delete(task.uuid);
                            taskIntervals[currentHoveredRow + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                            task.row = currentHoveredRow + 1;
                        }
                    });
                }
            }

            // moving
            if (startDragPosX - mousePageX > 49) {
                let tasksUUIDs = findTasksInRow(selectedTask.row + 1, selectedTask.fromDate, selectedTask.toDate);
                
                selectedTask.fromDate = changeDays(selectedTask.fromDate, -1);
                selectedTask.toDate = changeDays(selectedTask.toDate, -1);

                startDragPosX = mousePageX;
                taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });

                tasksUUIDs.forEach((taskUUID) => {
                    let task: Task = findTaskByUUID(selectedTask.row + 1, taskUUID);

                    if(task && !invalidRow(selectedTask.row, "", task.fromDate, task.toDate)) {
                        fixRow(task);
                    }
                });
            } 
            else if (startDragPosX - mousePageX < -49) {
                let tasksUUIDs = findTasksInRow(selectedTask.row + 1, selectedTask.fromDate, selectedTask.toDate);

                selectedTask.fromDate = changeDays(selectedTask.fromDate, 1);
                selectedTask.toDate = changeDays(selectedTask.toDate, 1);

                startDragPosX = mousePageX;
                taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });

                tasksUUIDs.forEach((taskUUID) => {
                    let task: Task = findTaskByUUID(selectedTask.row + 1, taskUUID);

                    if(task && !invalidRow(selectedTask.row, "", task.fromDate, task.toDate)) {
                        fixRow(task);
                    }
                });
            }
            break;
        case DragStatus.TaskLeftResize:
            if (startDragPosX - mousePageX > 49 && !invalidRow(selectedTask.row, selectedTask.uuid, changeDays(selectedTask.fromDate, -1), selectedTask.toDate)) {
                selectedTask.fromDate = changeDays(selectedTask.fromDate, -1);
                startDragPosX = mousePageX;
                differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
                taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });
            } 
            else if (startDragPosX - mousePageX < -49 && differenceOfDays > 0) {
                selectedTask.fromDate = changeDays(selectedTask.fromDate, 1);
                startDragPosX = mousePageX;
                differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
                taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });
            }
            break;
        case DragStatus.TaskRightResize:
            if (mousePageX - startDragPosX > 49 && !invalidRow(selectedTask.row, selectedTask.uuid, selectedTask.fromDate, changeDays(selectedTask.toDate, 1))) {
                selectedTask.toDate = changeDays(selectedTask.toDate, 1);
                startDragPosX = mousePageX;
                differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
                taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });
            } 
            else if (mousePageX - startDragPosX < -49 && differenceOfDays > 0) {
                selectedTask.toDate = changeDays(selectedTask.toDate, -1);
                startDragPosX = mousePageX;
                differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
                taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });
            }
            break;
    }
}

async function mouseUpEvent() {
    if(dragStatus === DragStatus.None)
        return;
    
    if(dragStatus === DragStatus.TaskCreate) { //&& inactiveTask !== undefined) {
        //emit('inactiveTaskEdit', inactiveTask.value);
        editing = true;        
    }
    else {
        emit('taskEdit', undefined);
        editing = false;     
        draggedTaskObject.value = undefined;
        emit('onDraggedTaskChange', draggedTaskObject.value);
        console.log(changedTasks);
        saveTask(selectedTask);
    }
    
    dragStatus = DragStatus.None;
    mouseButtonDown = false;
}

//

</script>

<template>
    <div v-if="!pending" class="relative mt-4 overflow-hidden select-none" @mousedown="mousePressedEvent">
        <div class="absolute top-1/2 z-30" style="height: calc(100% - 1rem);">
            <div class="relative -top-1/2 flex justify-center items-center w-40 h-full px-4 text-left bg-white rounded-r-lg shadow-[0_0px_20px_-10px_rgba(0,0,0,0.3)]">Daily responsibility</div>
        </div>
        <div v-for="(row, index) in rows" @mouseover="onRowChangeEvent(index)" class="relative h-11 mb-0.5">
            <div v-for="task in row.filter((task: Task) => task.row === index)" :id="task.uuid" @mousedown="startTaskDragging($event, task)" class="absolute flex h-full left-5 px-px"
            :style="{ left: prps.calendarDragPos! + (taskPlacementPos(task).from)*prps.columnWidth! + 'px', width: taskPlacementPos(task).taskLength * prps.columnWidth! + 'px' }"> <!--TODO: precalculate-->
                <div v-if="draggedTaskObject !== undefined && draggedTaskObject.uuid === task.uuid" class="size-full rounded-md" :style="{ backgroundColor: draggedTaskObject.color, opacity: 0.6 }">
                    <div class="size-full p-1 pl-2">
                        <div class="relative size-full">
                            <div class="flex items-center h-full">
                                <div v-if="draggedTaskObject.status !== 'No status'">{{ draggedTaskObject.status.slice(0,2) }}</div>
                                    <h3 class="leading-none select-none">{{ draggedTaskObject.name }}</h3>
                                </div>
                            <div class="absolute flex items-center h-full right-1 top-0">
                                <div class="relative size-8 select-none">
                                    <div v-for="num in 3">   
                                    
                                    </div>
                                </div>
                            </div>                
                        </div>
                    </div>
                </div>                             
                <div v-else class="size-full rounded-md" :style="{ backgroundColor: task.color}">
                    <div @mousedown="startTaskLeftResizeDragging($event, task)" class="absolute left-0 z-20 w-3 h-full cursor-e-resize"></div>
                    <div @mousedown="startTaskRightResizeDragging($event, task)" class="absolute right-0 z-20 w-3 h-full cursor-e-resize"></div>
                    <div class="size-full p-1 pl-2">
                        <div class="relative size-full">
                            <div class="flex items-center h-full">
                                <div v-if="task.status !== 'No status'">{{ task.status.slice(0,2) }}</div>
                                <h3 class="leading-none select-none">{{ task.name }}</h3>
                            </div>
                            <div class="absolute flex items-center h-full right-1 top-0">
                                <div class="relative size-8 select-none">
                                    <div v-for="num in Math.min(task.assignees!.length, 3)">
                                        <img v-if="task.assignees![num-1]" :src="'data:image/jpg;base64,' + pfps![task.assignees![num-1]]" class="absolute size-full rounded-full object-cover" :style="{ right: (num-1)*1.4 + 'rem', 'z-index': num+10 }" draggable="false">
                                    </div>
                                </div>
                            </div>                
                        </div>
                    </div>
                </div>                
            </div>
            <div v-if="inactiveTask !== undefined && inactiveTask.row === index" class="absolute flex h-full left-5 px-px"
            :style="{ left: prps.calendarDragPos! + (inactiveTaskPlacementPos(inactiveTask).from)*prps.columnWidth! + 'px', width: inactiveTaskPlacementPos(inactiveTask).taskLength * prps.columnWidth! + 'px' }">
                <div class="size-full rounded-md" style="background-color: #977aff; opacity: 0.6;">
                    <div class="size-full p-1 pl-2">
                        <div class="relative size-full">
                            <div class="flex items-center h-full">
                                <h3 class="leading-none select-none">New</h3>
                            </div>
                            <div class="absolute flex items-center h-full right-1 top-0">
                                <div class="relative size-8 select-none">
                                    <div v-for="num in 3"></div>
                                </div>
                            </div>                
                        </div>
                    </div>
                </div>
            </div>
        </div>            
        <div class="relative h-11 mb-0.5"></div>
    </div>
</template> 
