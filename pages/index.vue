<script setup lang="ts">

const Title = "Timeline Title";

let pending = true;
let tasks: Task[];
const taskIntervals: Map<string, TaskTimestampInterval>[] = [];
for(let i = 0; i < 10; i++) {
    taskIntervals.push(new Map());
}

await useFetch('/api/tasks/tasksList', { method: 'post' })!.then((value) => { 
    pending = false; 
    tasks = value.data.value as Task[];
    tasks.forEach((task) => {
        taskIntervals[task.row].set(task.uuid, { from: new Date(task.fromDate.year, task.fromDate.month - 1, task.fromDate.day).getTime(), to: new Date(task.toDate.year, task.toDate.month - 1, task.toDate.day).getTime() });
    });
});

const startDragPosX = ref(0);
const relativeDragPos = ref(0);
const tempDragPos = ref(0);

enum Dragging {
    None, Calendar, Task, TaskLeftResize, TaskRightResize
}

const draggingValue = ref(Dragging.None);
let currentEditedTask: Task;
let draggedTask: HTMLElement
let draggedTaskCopy: HTMLElement;
let draggedTaskFromDate: CDate;
let draggedTaskToDate: CDate;
let prevDraggedTaskRow: number;
let draggedTaskRow: number = -1;
let differenceOfDays: number;
let clickOffsetX: number;
let clickOffsetY: number;

const datesOffset = ref(0);
const datesPos = ref(0);

const screenSize = ref({width: 1920, height: 1080});
const columnWidth = 56;

function CDateToDate(date: CDate) {
    return new Date(date.year, date.month - 1, date.day);
}

async function taskAdded(task: Task) {
    await $fetch('/api/tasks/tasksList', { method: 'post' })!.then((value) => {
        tasks = value;
        taskIntervals[task.row].set(task.uuid, { from: CDateToDate(task.fromDate).getTime(), to: CDateToDate(task.toDate).getTime() });
    });
    
    refreshNuxtData();
}

function invalidRow(row: number, currentUUID: string, fromDate: CDate, toDate: CDate) {
    let returnValue = false;
    if(!taskIntervals[row])
        return returnValue;
    
    taskIntervals[row].forEach((value: TaskTimestampInterval, key: string) => {
        if(key == currentUUID)
            return;

        const fromTimeTimestamp = CDateToDate(fromDate).getTime();
        const toTimeTimestamp = CDateToDate(toDate).getTime()
        if((fromTimeTimestamp >= value.from && fromTimeTimestamp <= value.to) || (toTimeTimestamp <= value.to && toTimeTimestamp >= value.from) || (fromTimeTimestamp <= value.from && toTimeTimestamp >= value.to)) {
            returnValue = true;
        }
    });

    return returnValue;
}

function getDifferenceOfDays(fromDate: CDate, toDate: CDate) {
    const fdate = CDateToDate(fromDate);
    const tdate = CDateToDate(toDate);

    return (tdate.getTime() - fdate.getTime()) / 86400000;
}

function changeDays(date: CDate, value: number) {
    const newDate = CDateToDate(date);
    newDate.setDate(newDate.getDate() + value);

    return { day: newDate.getDate(), month: newDate.getMonth() + 1, year: newDate.getFullYear() }
}

function taskPlacementPos(date: CDate) {
    const todayDayTimestamp = Math.floor(new Date().getTime() / 86400000);
    const taskStartDayTimestamp = Math.floor(CDateToDate(date).getTime() / 86400000) + 4;
    const timeFromToday = taskStartDayTimestamp - todayDayTimestamp;

    return timeFromToday;
}
// (tempDragPos.value + Math.floor(CDateToDate(date).getTime() / 86400000) + 4 - todayDayTimestamp * columnWidth) = pos
// CDateToDate(date).getTime() = (pos + Math.floor(new Date().getTime() / 86400000) * columnWidth - tempDragPos.value - 4) * 86400000
// start dragging
function starCalendarEvent(event: MouseEvent) {
    if(draggingValue.value !== Dragging.None)
        return;

    if(event.button === 0) {
        relativeDragPos.value = tempDragPos.value;
        console.log((event.pageX + Math.floor(new Date().getTime() / 86400000) * columnWidth - tempDragPos.value - 4) * 86400);
        //draggedTask.style.left = (tempDragPos.value + taskPlacementPos(draggedTaskFromDate) * columnWidth).toString() + 'px';
        startDragPosX.value = event.screenX;
    }
    else if(event.button === 1) {
        draggingValue.value = Dragging.Calendar;
        startDragPosX.value = event.screenX;
    }
}

function startTaskDragging(event: MouseEvent, task: Task) {    
    if(draggingValue.value !== Dragging.None)
        return;
    draggedTask = document.getElementById(task.uuid)!;    
    if(!draggedTask)
        return;
    
    const draggedTaskCopyNode = draggedTask.cloneNode(true) as HTMLElement;
    draggedTaskCopyNode.id = "draggedTaskCopy";
    document.getElementById('draggingTaskHolder')!.after(draggedTaskCopyNode);
    draggedTask.classList.add("opacity-40");
    clickOffsetX = event.offsetX;
    clickOffsetY = event.offsetY;

    draggedTaskCopy = document.getElementById('draggedTaskCopy')!;
    draggedTaskCopy.classList.add('absolute', 'pointer-events-none');
    draggedTaskCopy.style.left = (event.pageX - clickOffsetX).toString() + 'px';
    draggedTaskCopy.style.top = (event.pageY - clickOffsetY).toString() + 'px';
    draggedTaskCopy.style.height = draggedTask.clientHeight.toString() + 'px';
    draggedTaskCopy.style.zIndex = '1';
    draggingValue.value = Dragging.Task;
    startDragPosX.value = event.pageX;
    currentEditedTask = task;
    draggedTaskFromDate = currentEditedTask.fromDate;
    draggedTaskToDate = currentEditedTask.toDate;

    if(draggedTaskRow === -1) {
        draggedTaskRow = currentEditedTask.row;
    }

    prevDraggedTaskRow = draggedTaskRow;
}

function startTaskLeftResizeDragging(event: MouseEvent, task: Task) {  
    if(draggingValue.value !== Dragging.None)
        return;

    draggingValue.value = Dragging.TaskLeftResize;
    startDragPosX.value = event.pageX;
    currentEditedTask = task;
    differenceOfDays = getDifferenceOfDays(task.fromDate, task.toDate);
}

function startTaskRightResizeDragging(event: MouseEvent, task: Task) {
    if(draggingValue.value !== Dragging.None)
        return;

    draggingValue.value = Dragging.TaskRightResize;
    startDragPosX.value = event.pageX;
    currentEditedTask = task;
    differenceOfDays = getDifferenceOfDays(task.fromDate, task.toDate);
}

// dragging
function moveCalendarComponents(event: MouseEvent) {
    // disable default dragging
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    
    // move calendar on drag
    if (!event.buttons) return;

    switch (draggingValue.value) {
        case Dragging.Calendar:
            tempDragPos.value = event.screenX - startDragPosX.value + relativeDragPos.value;

            datesOffset.value = tempDragPos.value % columnWidth;
            datesPos.value = tempDragPos.value / columnWidth < 0 ? Math.ceil(tempDragPos.value / columnWidth) : Math.floor(tempDragPos.value / columnWidth);
            break;
        case Dragging.Task:
            draggedTaskCopy.style.left = (event.pageX - clickOffsetX).toString() + 'px';
            draggedTaskCopy.style.top = (event.pageY - clickOffsetY).toString() + 'px';

            if(startDragPosX.value - event.pageX > 49) {
                draggedTaskFromDate = changeDays(draggedTaskFromDate, -1);
                draggedTaskToDate = changeDays(draggedTaskToDate, -1);
                for(let i = 0; i < 10; i++) {
                    if(!invalidRow(i, currentEditedTask.uuid, draggedTaskFromDate, draggedTaskToDate)) {
                        draggedTaskRow = i;
                        document.getElementById(draggedTaskRow.toString())!.appendChild(draggedTask);
                        break;
                    }
                }               

                relativeDragPos.value = tempDragPos.value;
                draggedTask.style.left = (tempDragPos.value + taskPlacementPos(draggedTaskFromDate) * columnWidth).toString() + 'px';
                startDragPosX.value = event.pageX;               
                taskIntervals[currentEditedTask.row].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            } 
            else if(startDragPosX.value - event.pageX < -49) {
                draggedTaskFromDate = changeDays(draggedTaskFromDate, 1);
                draggedTaskToDate = changeDays(draggedTaskToDate, 1);

                for(let i = 0; i < 10; i++) {
                    if(!invalidRow(i, currentEditedTask.uuid, draggedTaskFromDate, draggedTaskToDate)) {
                        draggedTaskRow = i;
                        document.getElementById(draggedTaskRow.toString())!.appendChild(draggedTask);
                        break;
                    }
                }

                relativeDragPos.value = tempDragPos.value;
                draggedTask.style.left = (tempDragPos.value + taskPlacementPos(draggedTaskFromDate) * columnWidth).toString() + 'px';
                startDragPosX.value = event.pageX;
                taskIntervals[currentEditedTask.row].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            }
            break;
        case Dragging.TaskLeftResize:
            if(startDragPosX.value - event.pageX > 49) {
                currentEditedTask.fromDate = changeDays(currentEditedTask.fromDate, -1);
                startDragPosX.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
                taskIntervals[currentEditedTask.row].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            } 
            else if(startDragPosX.value - event.pageX < -49 && differenceOfDays > 0) {
                currentEditedTask.fromDate = changeDays(currentEditedTask.fromDate, 1);
                startDragPosX.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
                taskIntervals[currentEditedTask.row].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            }
            break;
        case Dragging.TaskRightResize:
            if(event.pageX - startDragPosX.value > 49) {
                currentEditedTask.toDate = changeDays(currentEditedTask.toDate, 1);
                startDragPosX.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
                taskIntervals[currentEditedTask.row].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            } 
            else if(event.pageX - startDragPosX.value < -49 && differenceOfDays > 0) {
                currentEditedTask.toDate = changeDays(currentEditedTask.toDate, -1);
                startDragPosX.value = event.pageX;
                differenceOfDays = getDifferenceOfDays(currentEditedTask.fromDate, currentEditedTask.toDate);
                taskIntervals[currentEditedTask.row].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            }
            break;     
    }
}

// end dragging
function endDragging() {
    switch(draggingValue.value) {
        case Dragging.Calendar:
            relativeDragPos.value = tempDragPos.value;
            draggingValue.value = Dragging.None;
            break;
        case Dragging.Task:
            document.getElementById(currentEditedTask.uuid)?.classList.remove("opacity-40");
            draggedTaskCopy.remove();
            draggingValue.value = Dragging.None;
            currentEditedTask.fromDate = draggedTaskFromDate;
            currentEditedTask.toDate = draggedTaskToDate;
            taskIntervals.forEach((interval) => { interval.delete(currentEditedTask.uuid); });
            taskIntervals[draggedTaskRow].set(currentEditedTask.uuid, { from: CDateToDate(currentEditedTask.fromDate).getTime(), to: CDateToDate(currentEditedTask.toDate).getTime() });
            prevDraggedTaskRow = draggedTaskRow;

            $fetch('/api/tasks/tasksEdit', {
                method: 'post',
                body: { 
                    uuid: currentEditedTask.uuid,
                    color: currentEditedTask.color,
                    name: currentEditedTask.name,
                    row: draggedTaskRow,
                    status: currentEditedTask.status,
                    fromDate: currentEditedTask.fromDate,
                    toDate: currentEditedTask.toDate,
                    assignees: currentEditedTask.assignees,
                    description: currentEditedTask.description,
                    createdBy: currentEditedTask.createdBy
                }
            });
            break;
        case Dragging.TaskLeftResize:
            draggingValue.value = Dragging.None;
            $fetch('/api/tasks/tasksEdit', {
                method: 'post',
                body: { 
                    uuid: currentEditedTask.uuid,
                    color: currentEditedTask.color,
                    name: currentEditedTask.name,
                    row: draggedTaskRow,
                    status: currentEditedTask.status,
                    fromDate: currentEditedTask.fromDate,
                    toDate: currentEditedTask.toDate,
                    assignees: currentEditedTask.assignees,
                    description: currentEditedTask.description,
                    createdBy: currentEditedTask.createdBy
                }
            });
            break;
        case Dragging.TaskRightResize:
            draggingValue.value = Dragging.None;
            $fetch('/api/tasks/tasksEdit', {
                method: 'post',
                body: { 
                    uuid: currentEditedTask.uuid,
                    color: currentEditedTask.color,
                    name: currentEditedTask.name,
                    row: draggedTaskRow,
                    status: currentEditedTask.status,
                    fromDate: currentEditedTask.fromDate,
                    toDate: currentEditedTask.toDate,
                    assignees: currentEditedTask.assignees,
                    description: currentEditedTask.description,
                    createdBy: currentEditedTask.createdBy
                }
            });
            break;
    }    
}

function generateDate(dateNum: number) {
    const date = new Date(new Date().getTime() + dateNum * 86400000);

    const newDateNum = date.getDate();
    let day = getWeekDay(date.getDay());

    return day + " " + newDateNum;
}

onMounted(() => {
    screenSize.value = getScreenSize();
});

</script>

<template>
    <div v-if="!pending" class="flex flex-col w-full h-screen" id="draggingTaskHolder" @mousemove="moveCalendarComponents" @mouseup="endDragging">
        <div class="py-4 shadow-md">
            <div class="px-4">
                <h1>{{ Title }}</h1>
            </div>
            <div class="relative flex justify-center w-full py-3 overflow-hidden">
                <p class="py-0.5 opacity-0">Dates</p>
                <div class="absolute z-5 flex" :style="{left: datesOffset - 5 * columnWidth + 'px'}">
                    <p v-for="date in Math.ceil(screenSize.width * 0.02 + 10)" class="w-14 py-0.5 text-center rounded-md text-gray-500 font-bold"
                    :class="{'bg-red-100': !(date - datesPos - 9), 'text-gray-900': !(date - datesPos - 9)}">
                        {{ generateDate(date - datesPos - 9) }}
                    </p>
                </div>
            </div>
        </div>
        <div class="relative flex-auto min-w-full">
            <CalendarTaskEdit @task-added="taskAdded"/>
            <div class="mt-4">
                <div @mousedown="starCalendarEvent" class="grid overflow-hidden cursor-grab select-none" :class="{'cursor-grabbing': draggingValue === Dragging.Calendar}">
                    <div v-for="row in 10" :id="(row - 1).toString()" class="relative h-11 mb-0.5 bg-white">
                        <CalendarTask
                            @start-task-left-resize-dragging="startTaskLeftResizeDragging" @start-task-right-resize-dragging="startTaskRightResizeDragging" @start-task-dragging="startTaskDragging"
                            :row="row" :tempDragPos="tempDragPos" :tasks="tasks!"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>