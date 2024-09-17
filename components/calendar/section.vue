<script setup lang="ts">

const emit = defineEmits(['taskEdit', 'onDraggedTaskChange', 'inactiveTaskEdit', 'showSectionContextMenu', 'showTaskContextMenu']);

defineExpose({
    mousePressedEvent, mouseMoveEvent, mouseUpEvent, onEditTask, onCreateTask, onCloseEdit, onEditResizeTask, onDuplicateTask, onDeleteTask, onDeleteTaskAndGetValues, onChangeTaskSection, findClosestAvailableRow
});

const props = defineProps({
    section: Object as PropType<Section>,
    columnWidth: Number,
    datesPos: Number,
    calendarDragPos: Number,
    profile: Object as PropType<Profile>
});

const prps = toRef(props);
const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });
const dayTimestamp = 86400000;
const taskIntervals: Map<string, TaskTimestampInterval>[] = [new Map<string, TaskTimestampInterval>, new Map<string, TaskTimestampInterval>, new Map<string, TaskTimestampInterval>];

let rows: Ref<Task[][]> = ref([[], [], []]);
let pending: boolean = true;
let mouseButtonDown: boolean = false;
let selectedTask: Task;
let inactiveTask = ref();
let differenceOfDays: number;

let startDragPosX: number;
let draggedTaskObject = ref();
let currentHoveredRow: number;
let prevHoveredRow: number = -1;
let editing: boolean = false;
let changedTasks: Task[] = [];


enum DragStatus {
    None, TaskCreate, TaskDrag, TaskLeftResize, TaskRightResize
}

let dragStatus: DragStatus = DragStatus.None;


// database functions

// do this in index for each section and then passing it through props
await $fetch('/api/tasks/tasksList', { method: 'post', body: { sectionIndex: props.section!.sectionIndex }}).then((value) => {
    pending = false; 
    let tasks = value as Task[];

    let maxRow: number = 2;
    tasks.forEach((task) => { if(task.row > maxRow) { maxRow = task.row }});

    for(let i = 3; i < maxRow + 1; i++) {
        addRow();
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

async function saveTasks(tasks: Task[]) {
    $fetch('/api/tasks/tasksEdit', {
        method: 'post',
        body: { 
            tasks
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

        if ((fromTimeTimestamp >= value.from && fromTimeTimestamp <= value.to) || (toTimeTimestamp <= value.to && toTimeTimestamp >= value.from) || (fromTimeTimestamp <= value.from && toTimeTimestamp >= value.to)) 
            returnValue = true;   
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
    let foundTask: Task | undefined = undefined;
    
    for(let i = 0; i < rows.value[row].length; i++) {
        if(rows.value[row][i].uuid === uuid)
            foundTask = rows.value[row][i];
    }

    return foundTask;
}

function changeRow(uuid: string, row1: number, row2: number) {
    let foundTask: Task | undefined = undefined; 
    rows.value[row1].forEach((task: Task, index: number) => {
        if(task.uuid === uuid) {
            foundTask = task;
            rows.value[row1].splice(index, 1);            
        }
    });
    
    if(foundTask)
        rows.value[row2].push(foundTask);
}

function fixRow(task: Task, prevFromDate: CDate | undefined = undefined, prevToDate: CDate | undefined = undefined) {
    let tempFromDate: CDate = prevFromDate ? prevFromDate : task.fromDate;
    let tempToDate: CDate = prevToDate ? prevToDate : task.toDate;

    while(task.row - 1 >= 0 && !invalidRow(task.row - 1, task.uuid, task.fromDate, task.toDate)) {
        changeRow(task.uuid, task.row, task.row - 1);
        taskIntervals[task.row].delete(task.uuid);
        taskIntervals[task.row - 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
        task.row = task.row - 1; 

        if(!arrayIncludesTask(changedTasks, task))
            changedTasks.push(task);
        
        for(let i = task.row + 2; i < rows.value.length + 1; i++) {
            for(let taskUUID of findTasksInRow(i, tempFromDate, tempToDate)) {
                let newTask: Task | undefined = findTaskByUUID(i, taskUUID);

                if(newTask && !invalidRow(i - 1, task.uuid, newTask.fromDate, newTask.toDate)) {
                    tempFromDate = CDateToTimestamp(newTask.fromDate) < CDateToTimestamp(tempFromDate) ? newTask.fromDate : tempFromDate;
                    tempToDate = CDateToTimestamp(newTask.toDate) > CDateToTimestamp(tempToDate) ? newTask.toDate : tempToDate;   

                    changeRow(newTask.uuid, i, i - 1);
                    taskIntervals[i].delete(newTask.uuid);
                    taskIntervals[i - 1].set(newTask.uuid, { from: CDateToDate(newTask.fromDate).getTime(), to: CDateToDate(newTask.toDate).getTime() });
                    newTask.row = i - 1;
                    
                    if(!arrayIncludesTask(changedTasks, newTask))
                        changedTasks.push(newTask);                    
                } 
                else
                    break;
            }
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

function arrayIncludesTask(array: Task[], task: Task) {
    let includes: boolean = false;
    array.forEach((arrayTask) => {
        if(arrayTask.uuid === task.uuid) {
            includes = true;            
        }
    })

    return includes;
}

function addRow() {
    rows.value.push([]);
    taskIntervals.push(new Map<string, TaskTimestampInterval>);
}

function deleteEmptyRows() {
    while(rows.value[rows.value.length - 1].length === 0 && rows.value.length > 3) {
        rows.value.pop();
        taskIntervals.pop();
    }
}

function checkSwitchRow(switchTask: Task) {
    let tempFromDate: CDate = switchTask.fromDate;
    let tempToDate: CDate = switchTask.toDate;

    if(switchTask.row === currentHoveredRow && invalidRow(switchTask.row, switchTask.uuid, switchTask.fromDate, switchTask.toDate)) {
        let taskUUIDs: string[] = findTasksInRow(switchTask.row, tempFromDate, tempToDate);
        let intersectedTask: Task | undefined = undefined;
        
        for(const taskUUID of taskUUIDs) {
            if(taskUUID !== switchTask.uuid)
                intersectedTask = findTaskByUUID(switchTask.row, taskUUID);
        }

        if(intersectedTask) {   
            tempFromDate = intersectedTask.fromDate;
            tempToDate = intersectedTask.toDate;
            let alreadyChangedTaskUUIDs: string[] = [];

            for(let i = switchTask.row + 1; i < rows.value.length; i++) {
                if(invalidRow(i, switchTask.uuid, tempFromDate, tempToDate)) {
                    if(i >= rows.value.length - 1) {
                        addRow();
                    }
                    findTasksInRow(i, tempFromDate, tempToDate).forEach((taskUUID) => {
                        let task: Task | undefined = findTaskByUUID(i, taskUUID);

                        if(task && !alreadyChangedTaskUUIDs.includes(task.uuid)) {
                            tempFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tempFromDate) ? task.fromDate : tempFromDate;
                            tempToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tempToDate) ? task.toDate : tempToDate;                                
     
                            changeRow(task.uuid, i, i + 1);
                            taskIntervals[i].delete(task.uuid);
                            taskIntervals[i + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                            task.row = i + 1;
                            alreadyChangedTaskUUIDs.push(task.uuid);

                            if(!arrayIncludesTask(changedTasks, task))
                                changedTasks.push(task);
                        }
                    })
                }
                else
                    break;

                if(!invalidRowIgnoreUUIDs(i + 1, alreadyChangedTaskUUIDs, tempFromDate, tempToDate))
                    break;
            }

            taskUUIDs.forEach((taskUUID) => {
                let task: Task | undefined = findTaskByUUID(switchTask.row, taskUUID);                    
                
                if(task && task.uuid !== switchTask.uuid) {
                    tempFromDate = task.fromDate;
                    tempToDate = task.toDate;
                
                    if(switchTask.row >= rows.value.length - 1) {
                        addRow();
                    }

                    changeRow(task.uuid, switchTask.row, switchTask.row + 1);
                    taskIntervals[switchTask.row].delete(task.uuid);
                    taskIntervals[switchTask.row + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                    task.row = switchTask.row + 1;
                    
                    if(!arrayIncludesTask(changedTasks, task))
                        changedTasks.push(task);
                }
            });
        }
    }
    else if(switchTask.row !== currentHoveredRow) { // TODO: somehow implement currentHoveredRow !== prevHoveredRow
        if(invalidRow(currentHoveredRow, switchTask.uuid, switchTask.fromDate, switchTask.toDate)) {
            if(currentHoveredRow > 0 && invalidRow(currentHoveredRow - 1, switchTask.uuid, switchTask.fromDate, switchTask.toDate)) {
                let taskUUIDs: string[] = findTasksInRow(currentHoveredRow, tempFromDate, tempToDate);
                let intersectedTask: Task | undefined = undefined;

                for(const taskUUID of taskUUIDs) {
                    if(taskUUID !== switchTask.uuid)
                        intersectedTask = findTaskByUUID(currentHoveredRow, taskUUID);
                }

                if(intersectedTask) {
                    tempFromDate = intersectedTask.fromDate;
                    tempToDate = intersectedTask.toDate;
                    let alreadyChangedTaskUUIDs: string[] = [];

                    for(let i = currentHoveredRow + 1; i < rows.value.length; i++) {            
                        if(invalidRow(i, switchTask.uuid, tempFromDate, tempToDate)) {
                            if(i >= rows.value.length - 1) {
                                addRow();
                            }

                            findTasksInRow(i, tempFromDate, tempToDate).forEach((taskUUID) => {
                                let task: Task | undefined = findTaskByUUID(i, taskUUID);
                                
                                if(task && !alreadyChangedTaskUUIDs.includes(task.uuid)) {
                                    tempFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tempFromDate) ? task.fromDate : tempFromDate;
                                    tempToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tempToDate) ? task.toDate : tempToDate;

                                    changeRow(task.uuid, i, i + 1);
                                    taskIntervals[i].delete(task.uuid);
                                    taskIntervals[i + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                                    task.row = i + 1;                          
                                    alreadyChangedTaskUUIDs.push(task.uuid);

                                    if(!arrayIncludesTask(changedTasks, task))
                                        changedTasks.push(task);
                                }
                            })
                        }

                        if(!invalidRowIgnoreUUIDs(i + 1, alreadyChangedTaskUUIDs, tempFromDate, tempToDate))
                            break;
                    }
                    
                    taskUUIDs.forEach((taskUUID) => {
                        let task: Task | undefined = findTaskByUUID(currentHoveredRow, taskUUID);                    
                        if(task && task.uuid !== switchTask.uuid) {
                            if(currentHoveredRow >= rows.value.length - 1) {
                                addRow();
                            }

                            changeRow(task.uuid, currentHoveredRow, currentHoveredRow + 1);
                            taskIntervals[currentHoveredRow].delete(task.uuid);
                            taskIntervals[currentHoveredRow + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                            task.row = currentHoveredRow + 1;

                            if(!arrayIncludesTask(changedTasks, task))
                                changedTasks.push(task);
                        }
                    });

                    changeRow(switchTask.uuid, switchTask.row, currentHoveredRow);
                    taskIntervals[switchTask.row].delete(switchTask.uuid);
                    taskIntervals[currentHoveredRow].set(switchTask.uuid, { from: CDateToDate(switchTask.fromDate).getTime(), to: CDateToDate(switchTask.toDate).getTime() });
                    switchTask.row = currentHoveredRow;

                    fixRow(switchTask);
                    changedTasks.forEach((changedTask) => fixRow(changedTask));
                }
            }
            else if(Math.abs(switchTask.row - currentHoveredRow) === 1) {
                let canSwap: boolean = false;
                let thisRowTasks: Task[] = [];
                let targetTasks: Task[] = [];                        

                findTasksInRow(currentHoveredRow, switchTask.fromDate, switchTask.toDate).forEach((targetTaskUUID) => {
                    let foundTask: Task | undefined = findTaskByUUID(currentHoveredRow, targetTaskUUID);

                    if(foundTask) {
                        tempFromDate = CDateToTimestamp(foundTask.fromDate) < CDateToTimestamp(tempFromDate) ? foundTask.fromDate : tempFromDate;
                        tempToDate = CDateToTimestamp(foundTask.toDate) > CDateToTimestamp(tempToDate) ? foundTask.toDate : tempToDate;

                        targetTasks.push(foundTask);
                    }
                });

                let checkRow: number = switchTask.row > currentHoveredRow ? switchTask.row + 1 : currentHoveredRow + 1;
                findTasksInRow(switchTask.row, tempFromDate, tempToDate).forEach((thisRowTaskUUID) => {
                    let foundTask: Task | undefined = findTaskByUUID(switchTask.row, thisRowTaskUUID);

                    if(foundTask) {
                        thisRowTasks.push(foundTask);
                        
                        if(!(invalidRow(checkRow, "", tempFromDate, tempToDate) && !invalidRow(checkRow, "", foundTask.fromDate, foundTask.toDate)) || (!invalidRow(checkRow, "", tempFromDate, tempToDate) && !invalidRow(checkRow, "", foundTask.fromDate, foundTask.toDate)))
                            canSwap = true;
                    }
                });    

                if(canSwap && thisRowTasks.length === 1) {
                    targetTasks.forEach((task) => {
                        changeRow(task.uuid, currentHoveredRow, switchTask.row);
                        taskIntervals[currentHoveredRow].delete(task.uuid);
                        taskIntervals[switchTask.row].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                        task.row = switchTask.row;

                        if(!arrayIncludesTask(changedTasks, task))
                            changedTasks.push(task);
                    });

                    thisRowTasks.forEach((task) => {
                        changeRow(task.uuid, switchTask.row, currentHoveredRow);
                        taskIntervals[switchTask.row].delete(task.uuid);
                        taskIntervals[currentHoveredRow].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                        task.row = currentHoveredRow;

                        if(!arrayIncludesTask(changedTasks, task))
                            changedTasks.push(task);
                    });

                    fixRow(switchTask);
                    changedTasks.forEach((changedTask) => fixRow(changedTask));
                }
                else if(canSwap) {
                    if(currentHoveredRow !== 0 && invalidRow(currentHoveredRow - 1, switchTask.uuid, switchTask.fromDate, switchTask.toDate)) {
                        if(currentHoveredRow >= rows.value.length - 1) {
                            addRow();
                        }

                        changeRow(switchTask.uuid, switchTask.row, currentHoveredRow);
                        taskIntervals[switchTask.row].delete(switchTask.uuid);
                        taskIntervals[currentHoveredRow].set(switchTask.uuid, { from: CDateToDate(switchTask.fromDate).getTime(), to: CDateToDate(switchTask.toDate).getTime() });
                        switchTask.row = currentHoveredRow;

                        resizeCheckRow(switchTask);       
                    }
                    else if(currentHoveredRow === 0) {
                        let tFromDate: CDate | undefined = undefined;
                        let tToDate: CDate | undefined = undefined;

                        findTasksInRow(0, switchTask.fromDate, switchTask.toDate).forEach((taskUUID) => {
                            let task: Task | undefined = findTaskByUUID(0, taskUUID);

                            if(task) {
                                if(!tFromDate || !tToDate) {
                                    tFromDate = task.fromDate;
                                    tToDate = task.toDate;
                                }
                                else {
                                    tFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tFromDate) ? task.fromDate : tFromDate;
                                    tToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tToDate) ? task.toDate : tToDate;   
                                }
                            }
                        });
                        
                        let alreadyChangedTaskUUIDs: string[] = [];

                        if(tFromDate && tToDate) {
                            for(let i = 0; i < rows.value.length; i++) {
                                if(invalidRow(i, switchTask.uuid, tFromDate, tToDate)) {
                                    if(i >= rows.value.length - 1) {
                                        addRow();
                                    }

                                    for(let taskUUID of findTasksInRow(i, tFromDate, tToDate)) {
                                        let task: Task | undefined = findTaskByUUID(i, taskUUID);

                                        if(task && !alreadyChangedTaskUUIDs.includes(task.uuid)) {
                                            tFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tFromDate) ? task.fromDate : tFromDate;
                                            tToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tToDate) ? task.toDate : tToDate;                                
                    
                                            changeRow(task.uuid, i, i + 1);
                                            taskIntervals[i].delete(task.uuid);
                                            taskIntervals[i + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                                            task.row = i + 1;
                                            alreadyChangedTaskUUIDs.push(task.uuid);

                                            if(!arrayIncludesTask(changedTasks, task))
                                                changedTasks.push(task);
                                        }
                                    }
                                }
                                else
                                    break;

                                if(!invalidRowIgnoreUUIDs(i + 1, alreadyChangedTaskUUIDs, tFromDate, tToDate))
                                    break;
                            }  
                        }
                    }
                }      
            }
        } 
        else {
            let nextAvailableRow: number = 0;
            
            for(let i = currentHoveredRow - 1; i >= 0; i--) {
                if(invalidRow(i, switchTask.uuid, switchTask.fromDate, switchTask.toDate)) {
                    nextAvailableRow = i + 1;
                    break;
                }
            }

            if(nextAvailableRow !== switchTask.row) {
                if(nextAvailableRow >= rows.value.length - 1) {
                    addRow();
                }                 

                changeRow(switchTask.uuid, switchTask.row, nextAvailableRow);
                taskIntervals[switchTask.row].delete(switchTask.uuid);
                taskIntervals[nextAvailableRow].set(switchTask.uuid, { from: CDateToDate(switchTask.fromDate).getTime(), to: CDateToDate(switchTask.toDate).getTime() });
                switchTask.row = nextAvailableRow;
            }

            if(nextAvailableRow !== 0) {
                findTasksInRow(nextAvailableRow - 1, switchTask.fromDate, switchTask.toDate).forEach((taskUUID) => {
                    let task: Task | undefined = findTaskByUUID(nextAvailableRow - 1, taskUUID);

                    if(task)
                        fixRow(task);
                });
            }

            fixRow(switchTask);
            changedTasks.forEach((changedTask) => fixRow(changedTask));
        }
    }

    deleteEmptyRows();
}

function resizeCheckRow(resizeTask: Task) {
    let tempFromDate: CDate = resizeTask.fromDate;
    let tempToDate: CDate = resizeTask.toDate;

    if(invalidRow(resizeTask.row, resizeTask.uuid, resizeTask.fromDate, resizeTask.toDate)) {
        let taskUUIDs: string[] = findTasksInRow(resizeTask.row, tempFromDate, tempToDate);
        let intersectedTask: Task | undefined = undefined;
        for(const taskUUID of taskUUIDs) {
            if(taskUUID !== resizeTask.uuid)
            intersectedTask = findTaskByUUID(resizeTask.row, taskUUID);
        }
            
        if(intersectedTask) {
            tempFromDate = intersectedTask.fromDate;
            tempToDate = intersectedTask.toDate;
            let alreadyChangedTaskUUIDs: string[] = [];

            for(let i = resizeTask.row + 1; i < rows.value.length; i++) {
                if(invalidRow(i, resizeTask.uuid, tempFromDate, tempToDate)) {
                    if(i >= rows.value.length - 1) {
                        addRow();
                    }

                    findTasksInRow(i, tempFromDate, tempToDate).forEach((taskUUID) => {
                        let task: Task | undefined = findTaskByUUID(i, taskUUID);
                        
                        if(task && !alreadyChangedTaskUUIDs.includes(task.uuid)) {
                            tempFromDate = CDateToTimestamp(task.fromDate) < CDateToTimestamp(tempFromDate) ? task.fromDate : tempFromDate;
                            tempToDate = CDateToTimestamp(task.toDate) > CDateToTimestamp(tempToDate) ? task.toDate : tempToDate;                                

                            changeRow(task.uuid, i, i + 1);
                            taskIntervals[i].delete(task.uuid);
                            taskIntervals[i + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                            task.row = i + 1;
                            alreadyChangedTaskUUIDs.push(task.uuid);

                            if(!arrayIncludesTask(changedTasks, task))
                                changedTasks.push(task);
                        }
                    })
                }

                if(!invalidRowIgnoreUUIDs(i + 1, alreadyChangedTaskUUIDs, tempFromDate, tempToDate))
                    break;
            }
            
            taskUUIDs.forEach((taskUUID) => {
                let task: Task | undefined = findTaskByUUID(resizeTask.row, taskUUID);                    
                
                if(task && task.uuid !== resizeTask.uuid) {
                    if(resizeTask.row >= rows.value.length - 1) {
                        addRow();
                    }

                    tempFromDate = task.fromDate;
                    tempToDate = task.toDate;
                    changeRow(task.uuid, resizeTask.row, resizeTask.row + 1);
                    taskIntervals[resizeTask.row].delete(task.uuid);
                    taskIntervals[resizeTask.row + 1].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
                    task.row = resizeTask.row + 1;
                    
                    if(!arrayIncludesTask(changedTasks, task))
                        changedTasks.push(task);
                }
            });
        }
    }

    deleteEmptyRows();
}

async function onDuplicateTask(task: Task) {
    if(task.row >= rows.value.length - 1)
        addRow();

    onCreateTask(task);
    checkSwitchRow(task);

    if(!arrayIncludesTask(changedTasks, task))
        changedTasks.push(task);

    saveTasks(changedTasks);
    changedTasks = [];
}

async function onDeleteTask(task: Task) {
    let tasksAbove: Task[] = [];
    findTasksInRow(task.row + 1, task.fromDate, task.toDate).forEach((taskUUID) => {
        let taskAbove: Task | undefined = findTaskByUUID(task.row + 1, taskUUID);

        if(taskAbove)
            tasksAbove.push(taskAbove);
    });

    rows.value[task.row].forEach((_task: Task, index: number) => {
        if(_task.uuid === task.uuid) {
            rows.value[task.row].splice(index, 1);            
        }
    });
    taskIntervals[task.row].delete(task.uuid);

    for(let i = 0; i < changedTasks.length; i++) {
        if(changedTasks[i].uuid === task.uuid)
            changedTasks.splice(i, 1);
    }

    tasksAbove.forEach((taskAbove) => fixRow(taskAbove));

    deleteEmptyRows();
}

function onDeleteTaskAndGetValues(draggedTaskObj: DraggedTask) {
    let foundTask: Task | undefined = undefined;
    for(let i = 0; i < rows.value.length; i++) {
        let task: Task | undefined = findTaskByUUID(i, draggedTaskObj.uuid);

        if(task) {
            foundTask = task;
            break;
        }
    }
    if(foundTask) {
        onDeleteTask(foundTask);
    }

    return { task: foundTask, startDragPosX: startDragPosX };
}

async function onChangeTaskSection(e: MouseEvent, task: Task, draggedTaskObj: DraggedTask, _startDragPosX: number) {
    startDragPosX = _startDragPosX;
    selectedTask = task;
    inactiveTask.value = undefined;
    dragStatus = DragStatus.TaskDrag;
    mouseButtonDown = false;
    draggedTaskObject.value = draggedTaskObj;
}

function findClosestAvailableRow(fromDate: CDate, toDate: CDate) {
    let availableRow: number = -1;
    for(let i = rows.value.length - 1; i >= 0; i--) {
        if(invalidRow(i, "", fromDate, toDate)) {
            availableRow = i + 1;
            break;
        }
    }

    if(availableRow === -1)
        availableRow = 0;

    if(availableRow >= rows.value.length - 1) {
        addRow();
    }

    return availableRow;
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

async function onCreateTask(task: Task) {
    inactiveTask.value = {};

    if(task.row >= rows.value.length - 1)
        addRow();

    rows.value[task.row].push(task);
    taskIntervals[task.row].set(task.uuid, { from: CDateToTimestamp(task.fromDate), to: CDateToTimestamp(task.toDate) });
}

async function onCloseEdit() {
    inactiveTask.value = {};
    editing = false;
}

async function onEditResizeTask(task: Task, prevFromDate: CDate, prevToDate: CDate) {
    taskIntervals[task.row].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
    resizeCheckRow(task);
    
    for(let i = task.row + 1; i < rows.value.length; i++) {
        findTasksInRow(i, prevFromDate, prevToDate).forEach((foundUUID) => {
            let foundTask: Task | undefined = findTaskByUUID(i, foundUUID);

            if(foundTask && foundTask.uuid !== task.uuid && !arrayIncludesTask(changedTasks, foundTask))
                fixRow(foundTask);
        })
    }
    
    if(!arrayIncludesTask(changedTasks, task))
        changedTasks.push(task);
    
    fixRow(task, prevFromDate, prevToDate);
    changedTasks.forEach((task) => fixRow(task));
    saveTasks(changedTasks);
    changedTasks = [];

    emit('taskEdit', task);
}

async function onRowChangeEvent(index: number) {
    prevHoveredRow = currentHoveredRow;
    currentHoveredRow = index;
}


async function mousePressedEvent(e: MouseEvent, ignoreTaskCreation: boolean) {
    if (dragStatus !== DragStatus.None || e.button !== 0)
        return;
    
    if(editing) {
        editing = false;
        emit('taskEdit', undefined);
        inactiveTask.value = {}
    }
    else if(!ignoreTaskCreation) {
        if(inactiveTask) 
            inactiveTask.value = {};       

        dragStatus = DragStatus.TaskCreate;
        mouseButtonDown = true;
        startDragPosX = e.pageX;
        const todayDate = new Date();
        const val = e.pageX / props.columnWidth! < 0 ? Math.ceil(e.pageX / props.columnWidth!) : Math.floor(e.pageX / props.columnWidth!)
        const currentDate = changeDays({ day: todayDate.getDate(), month: todayDate.getMonth() + 1, year: todayDate.getFullYear() }, val - props.datesPos! - 3); // TODO: investigate, is buggy

        inactiveTask.value = {
            row: -1,
            sectionIndex: props.section!.sectionIndex,
            fromDate: currentDate,
            toDate: currentDate,
        };

        let row = -1;
        for (let i = currentHoveredRow; i >= 0; i--) {
            if (invalidRow(i, "", currentDate, currentDate)) {
                row = i + 1;
                break;
            }
        }

        if(row === -1) {
            row = 0;
        }        
        else if(row === currentHoveredRow && rows.value.length - 1 === row)
        {
            addRow();
        }

        inactiveTask.value.row = row;
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
            draggedTaskObject.value = { uuid: selectedTask.uuid, name: selectedTask.name, status: selectedTask.status, color: selectedTask.color, width: taskPlacementPos(task).taskLength * props.columnWidth!, sectionIndex: props.section!.sectionIndex };
            draggedTaskObject.value.left = e.pageX - e.offsetX;
            draggedTaskObject.value.top = e.pageY - e.offsetY;
            draggedTaskObject.value.clickOffsetX = e.offsetX;
            draggedTaskObject.value.clickOffsetY = e.offsetY;
            mouseButtonDown = false;
            startDragPosX = e.pageX;
            emit('onDraggedTaskChange', draggedTaskObject.value);
            emit('taskEdit', undefined);
            editing = false;
        }
        else {
            emit('taskEdit', selectedTask);
            editing = true;
        }        
    }, 200);
}

async function startTaskLeftResizeDragging(e: MouseEvent, task: Task) {
    selectedTask = task;
    dragStatus = DragStatus.TaskLeftResize;
    startDragPosX = e.pageX;
    mouseButtonDown = true;
    differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
}

async function startTaskRightResizeDragging(e: MouseEvent, task: Task) {
    selectedTask = task;
    dragStatus = DragStatus.TaskRightResize;
    startDragPosX = e.pageX;
    mouseButtonDown = true;  
    differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
}

async function mouseMoveEvent(mousePageX: number, mousePageY: number) { // TODO: experiment with datespos for threshold

    function resizeNew(invertor: number) {
        inactiveTask.value.toDate = changeDays(inactiveTask.value.toDate, invertor);
        startDragPosX = mousePageX!;
        differenceOfDays = getDifferenceOfDays(inactiveTask.value.fromDate, inactiveTask.value.toDate);
    }

    function resize(left:boolean, invertor: number) {
        let prevFromDate: CDate = selectedTask.fromDate;
        let prevToDate: CDate = selectedTask.toDate;

        if (left) selectedTask.fromDate = changeDays(selectedTask.fromDate, invertor);
        else selectedTask.toDate = changeDays(selectedTask.toDate, invertor);
        startDragPosX = mousePageX;
        differenceOfDays = getDifferenceOfDays(selectedTask.fromDate, selectedTask.toDate);
        taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });

        if(editing)
            emit("taskEdit", selectedTask);

        resizeCheckRow(selectedTask);

        findTasksInRow(selectedTask.row + 1, prevFromDate, prevToDate).forEach((foundUUID) => {
            let foundTask: Task | undefined = findTaskByUUID(selectedTask.row + 1, foundUUID);
            
            if(foundTask && foundTask.uuid !== selectedTask.uuid && !arrayIncludesTask(changedTasks, foundTask))
                fixRow(foundTask);
        });

        
        if(!arrayIncludesTask(changedTasks, selectedTask))
            changedTasks.push(selectedTask);

        fixRow(selectedTask, prevFromDate, prevToDate);
        changedTasks.forEach((task) => fixRow(task));
    }

    // moving
    function move(invertor: number) {
        const moveBy = -Math.round((startDragPosX - mousePageX - 8) / 49);

        let prevFromDate: CDate = selectedTask.fromDate;
        let prevToDate: CDate = selectedTask.toDate; 

        selectedTask.fromDate = changeDays(selectedTask.fromDate, moveBy);
        selectedTask.toDate = changeDays(selectedTask.toDate, moveBy);

        startDragPosX += props.columnWidth! * Math.abs(moveBy) * invertor;
        taskIntervals[selectedTask.row].set(selectedTask.uuid, { from: CDateToDate(selectedTask.fromDate).getTime(), to: CDateToDate(selectedTask.toDate).getTime() });

        findTasksInRow(selectedTask.row + 1, prevFromDate, prevToDate).forEach((foundUUID) => {
            let foundTask: Task | undefined = findTaskByUUID(selectedTask.row + 1, foundUUID);

            if(foundTask && foundTask.uuid !== selectedTask.uuid && !arrayIncludesTask(changedTasks, foundTask))
                fixRow(foundTask);
        });

        if(!arrayIncludesTask(changedTasks, selectedTask))
            changedTasks.push(selectedTask);

        fixRow(selectedTask, prevFromDate, prevToDate);
        changedTasks.forEach((task) => fixRow(task));

        if(editing)
            emit("taskEdit", selectedTask);
    }

    switch(dragStatus) {

        // task create resize event
        case DragStatus.TaskCreate:
            if (startDragPosX - mousePageX! > 49 && differenceOfDays > 0) resizeNew(-1);
            else if (startDragPosX - mousePageX! < -49 && !invalidRow(inactiveTask.value.row, "", inactiveTask.value.fromDate, changeDays(inactiveTask.value.toDate, 1))) resizeNew(1);
            break;

        // task drag event
        case DragStatus.TaskDrag: // TODO: add temporary row when out of bounds of rows
            if (!draggedTaskObject.value) return;
            
            checkSwitchRow(selectedTask);

            if ((startDragPosX - mousePageX - 8) > 49) move(-1);
            else if ((startDragPosX - mousePageX - 8) < -49) move(1);
            break;

        // resize left
        case DragStatus.TaskLeftResize:
            if (startDragPosX - mousePageX > 49) resize(true, -1);
            else if (startDragPosX - mousePageX < -49 && differenceOfDays > 0) resize(true, 1);
            break;

        // resize right
        case DragStatus.TaskRightResize:
            if (mousePageX - startDragPosX > 49) resize(false, 1);
            else if (mousePageX - startDragPosX < -49 && differenceOfDays > 0) resize(false, -1);
            break;
    }
}

async function mouseUpEvent() {
    if(dragStatus === DragStatus.None) {
        inactiveTask.value = {};
        editing = false;
        return;
    }

    if(dragStatus === DragStatus.TaskCreate && inactiveTask) {
        emit('inactiveTaskEdit', inactiveTask.value);
        editing = true;
    }
    else if(dragStatus === DragStatus.TaskDrag) {
        draggedTaskObject.value = undefined;
        emit('onDraggedTaskChange', draggedTaskObject.value);
        
        if(!arrayIncludesTask(changedTasks, selectedTask))
            changedTasks.push(selectedTask);

        saveTasks(changedTasks);
        changedTasks = [];
    }
    else {
        emit('taskEdit', undefined);
        editing = false;
        
        draggedTaskObject.value = undefined;
        emit('onDraggedTaskChange', draggedTaskObject.value);
        
        if(!arrayIncludesTask(changedTasks, selectedTask))
            changedTasks.push(selectedTask);

        saveTasks(changedTasks);
        changedTasks = [];
    }
    
    dragStatus = DragStatus.None;
    mouseButtonDown = false;
}

</script>

<template>
    <div v-if="!pending" class="relative mt-4 overflow-hidden select-none">
        <div @contextmenu.prevent="emit('showSectionContextMenu', $event, props.section!)" class="absolute top-1/2 z-30" style="height: calc(100% - 1rem);">
            <div class="relative -top-1/2 flex justify-center items-center w-40 h-full px-4 text-left bg-white rounded-r-lg shadow-[0_0px_20px_-10px_rgba(0,0,0,0.3)]">{{ props.section!.name }}</div>
        </div>

        <div v-for="(row, index) in rows" @mouseover="onRowChangeEvent(index)" class="relative h-11 mb-0.5">
            <div v-for="task in row.filter((task: Task) => task.row === index)" :id="task.uuid" @mousedown="startTaskDragging($event, task)" class="absolute flex h-full left-5 px-px"
            :style="{ left: prps.calendarDragPos! + (taskPlacementPos(task).from)*prps.columnWidth! + 'px', width: taskPlacementPos(task).taskLength * prps.columnWidth! + 'px' }"> <!--TODO: precalculate-->
                <!-- dragged task -->
                <div v-if="draggedTaskObject !== undefined && draggedTaskObject.uuid === task.uuid" class="size-full rounded-md" :style="{ backgroundColor: draggedTaskObject.color, opacity: 0.6 }">
                    <div class="size-full p-1 pl-2">
                        <div class="relative size-full">
                            <div class="flex items-center h-full">
                                <div v-if="draggedTaskObject.status !== 'No status'">{{ draggedTaskObject.status.slice(0,2) }}</div>
                                    <h3 class="font-semibold leading-none select-none" :class="{'text-white': !(parseInt(task.color.substring(1), 16) > 0xffffff / 2)}">{{ draggedTaskObject.name }}</h3>
                                </div>
                            <div class="absolute flex items-center h-full right-1 top-0">
                                <div class="relative size-8 select-none">
                                    <div v-for="num in 3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- task -->
                <div v-else @contextmenu.prevent="emit('showTaskContextMenu', $event, task)" class="size-full rounded-md cursor-pointer" :style="{ backgroundColor: task.color}">
                    <div @mousedown="startTaskLeftResizeDragging($event, task)" class="absolute left-0 z-20 w-3 h-full cursor-e-resize"></div>
                    <div @mousedown="startTaskRightResizeDragging($event, task)" class="absolute right-0 z-20 w-3 h-full cursor-e-resize"></div>
                    <div class="size-full p-1 pl-2">
                        <div class="relative size-full">
                            <div class="flex items-center h-full">
                                <div v-if="task.status !== 'No status'">{{ task.status.slice(0,2) }}</div>
                                <h3 class="font-semibold leading-none select-none" :class="{'text-white': !(parseInt(task.color.substring(1), 16) > 0xffffff / 2)}">{{ task.name }}</h3>
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
                                <h3 class="font-semibold leading-none select-none">New</h3>
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
        <div class="relative h-11 mb-0.5" @mouseover="onRowChangeEvent(rows.length)"></div>
    </div>
</template>