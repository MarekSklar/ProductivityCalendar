<script setup lang="ts">
import { useTemplateRefsList } from '@vueuse/core/index.cjs';

// session token
const sessionToken = getSessionToken();
navigateToInvalidSessionPage(sessionToken);

// tailwind config
const tw = getTwConfig();
const profiles = await fetchAllProfiles();
const profile = await fetchProfile(sessionToken);
const pfps = await fetchAllProfileImages();

const startDragPosX = ref(0);
const relativeDragPos = ref(0);
const calendarDragPos = ref(0);

let currentHoveredSection = 0;
let sections = ref<Section[]>([]);
// @ts-ignore
let sectionRefs = useTemplateRefsList<CalendarSection>(); 

let taskEditor = ref<any>(null);
let draggedTaskObject = ref();
let draggingCalendar = ref(false);
let leftTaskOffset = 60;
let rightTaskOffset = 60;

// time vatiables
const datesOffset = ref(0);
const weekOffset = ref(0);
const datesPos = ref(0);
const todayWeekDay = ref(new Date().getDay());

// render variables
const screenSize = ref({width: 1920, height: 1080});
const columnWidth = 56;
const columnHitboxWidth = Math.floor(columnWidth * 7 / 8);
const weekendOffset = ref(weekOffset.value - (todayWeekDay.value - 2) * columnWidth);

// context menu variables
let showTaskContextMenu = ref(false);
let showSectionContextMenu = ref(false);
let contextMenuTask = ref();
let contextMenuSection = ref();
let contextMenuX = ref(0);
let contextMenuY = ref(0);
let mouseOverContextMenu = ref(false);

let inactiveTaskCreateSectionIndex: number = -2;
let disableCreatingTasks = ref(false);
// section events

if(profiles && profiles.length > 0) {
    await $fetch('/api/sections/sectionsList', { method: 'post' }).then((value) => {
        let listedSections = value as Section[];

        for(let section of listedSections)
            sections.value.push(section);
    });

    if(sections.value.length === 0)
        addNewSection();    
}

async function addNewSection() {
    if(sections.value.length === 4) // limitoval bych to na 4 sekce, kdyztak na to mrknem
        return;

    await $fetch('/api/sections/sectionAdd', {
        method: 'post',
        body: {
            name: "New section",
            sectionIndex: sections.value.length
        }
    }).then((section) => { 
        sections.value.push(section as Section);
        disableCreatingTasks.value = false;
    }).catch(err => {});
}

// context menu events

async function onShowTaskContextMenu(e: MouseEvent, task: Task) {
    e.preventDefault();

    contextMenuTask.value = task;
    contextMenuX.value = e.clientX;
    contextMenuY.value = e.clientY;
    showTaskContextMenu.value = true;
}

async function onCloseTaskContextMenu() {
    contextMenuTask.value = undefined
    showTaskContextMenu.value = false;
    mouseOverContextMenu.value = false;
}

async function onDuplicateTask() {
    let task: Task = await $fetch('/api/tasks/tasksCreate', {
        method: 'post',
        body: {
            color: contextMenuTask.value.color,
            name: contextMenuTask.value.name,
            row: contextMenuTask.value.row + 1,
            sectionIndex: contextMenuTask.value.sectionIndex,
            status: contextMenuTask.value.status,
            fromDate: contextMenuTask.value.fromDate,
            toDate: contextMenuTask.value.toDate,
            createdBy: contextMenuTask.value.createdBy,
            assignees: contextMenuTask.value.assignees,
            description: contextMenuTask.value.description
        }
    });

    sectionRefs.value.at(contextMenuTask.value.sectionIndex).onDuplicateTask(task);
    onCloseTaskContextMenu();
}

async function onDeleteTask() {
    sectionRefs.value.at(currentHoveredSection).onDeleteTask(contextMenuTask.value);
    
    await $fetch('/api/tasks/taskDelete', {
        method: 'post',
        body: {
            uuid: contextMenuTask.value.uuid
        }
    });

    taskEditor.value.hideEditor();
    onCloseTaskContextMenu();
}

async function onShowSectionContextMenu(e: MouseEvent, section: Section) {
    e.preventDefault();

    contextMenuX.value = e.clientX;
    contextMenuY.value = e.clientY;
    showSectionContextMenu.value = true;
    contextMenuSection.value = section;
}


async function onCloseSectionContextMenu() {
    contextMenuSection.value = undefined;
    showSectionContextMenu.value = false;
    mouseOverContextMenu.value = false;
}

async function onRenameSection(name: string) {
    contextMenuSection.value.name = name;
    sections.value[contextMenuSection.value.sectionIndex].name = name;

    await $fetch('/api/sections/sectionEdit', {
        method: 'post',
        body: {
            uuid: contextMenuSection.value.uuid,
            name: contextMenuSection.value.name,
            sectionIndex: contextMenuSection.value.sectionIndex
        }
    });

    onCloseSectionContextMenu();
}

async function onDeleteSection() {
    if(sections.value.length > 1) {
        sections.value.splice(contextMenuSection.value.sectionIndex, 1);
        currentHoveredSection = Math.min(sections.value.length - 1, currentHoveredSection);
        inactiveTaskCreateSectionIndex = Math.min(sections.value.length - 1, inactiveTaskCreateSectionIndex);
        
        for(let i = 0; i < sections.value.length; i++) {
            if(sections.value[i].sectionIndex !== i) {
                sections.value[i].sectionIndex = i;
                await $fetch('/api/sections/sectionEdit', {
                    method: 'post',
                    body: {
                        uuid: sections.value[i].uuid,
                        name: sections.value[i].name,
                        sectionIndex: sections.value[i].sectionIndex
                    }
                });
            }
        }

        await $fetch('/api/sections/sectionDelete', {
            method: 'post',
            body: {
                uuid: contextMenuSection.value.uuid
            }
        });
    }

    onCloseSectionContextMenu();
}

//


// mouse events

async function mouseDownEvent(event: MouseEvent) {
    if (event.button === 1) {
        startDragPosX.value = event.screenX;
        draggingCalendar.value = true;
    }
    else if(profile.role === "admin") {
        if(showTaskContextMenu.value && !mouseOverContextMenu.value) {
            onCloseTaskContextMenu();
            return;
        }
        else if(showSectionContextMenu.value && !mouseOverContextMenu.value) {
            onCloseSectionContextMenu();
            return;
        }

        if((inactiveTaskCreateSectionIndex === -2 || inactiveTaskCreateSectionIndex === currentHoveredSection) && !disableCreatingTasks.value) {
            inactiveTaskCreateSectionIndex = currentHoveredSection
            sectionRefs.value.at(currentHoveredSection).mousePressedEvent(event, false);
        }
        else if(inactiveTaskCreateSectionIndex <= sections.value.length - 1 && !disableCreatingTasks.value) {
            sectionRefs.value.at(inactiveTaskCreateSectionIndex).mouseUpEvent(currentHoveredSection);
            sectionRefs.value.at(inactiveTaskCreateSectionIndex).onCloseEdit(currentHoveredSection);
            taskEditor.value.hideEditor();
            inactiveTaskCreateSectionIndex = currentHoveredSection
        }
        else {
            inactiveTaskCreateSectionIndex = -2;
        }
    }
}

async function mouseMoveEvent(event: MouseEvent) {
    // disable default dragging
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    // move calendar on drag

    if (!event.buttons || event.button !== 0)
        return;
        
    if(profile.role === "admin") {
        if(draggedTaskObject.value) {
            draggedTaskObject.value.left = event.pageX - draggedTaskObject.value.clickOffsetX;
            draggedTaskObject.value.top = event.pageY - draggedTaskObject.value.clickOffsetY;
            if(currentHoveredSection !== draggedTaskObject.value.sectionIndex) {
                let returnValues = sectionRefs.value.at(draggedTaskObject.value.sectionIndex).onDeleteTaskAndGetValues(draggedTaskObject.value);

                if(returnValues.task) {
                    if(draggedTaskObject.value.sectionIndex > currentHoveredSection) {
                        returnValues.task.row = sectionRefs.value.at(currentHoveredSection).findClosestAvailableRow(returnValues.task.fromDate, returnValues.task.toDate);
                    }
                    else {
                        returnValues.task.row = 0;
                    }

                    returnValues.task.sectionIndex = currentHoveredSection;
                    draggedTaskObject.value.sectionIndex = currentHoveredSection;

                    await $fetch('/api/tasks/taskEdit', {
                        method: 'post',
                        body: {
                            uuid: returnValues.task.uuid,
                            color: returnValues.task.color,
                            name: returnValues.task.name,
                            row: returnValues.task.row,
                            sectionIndex: returnValues.task.sectionIndex,
                            status: returnValues.task.status,
                            fromDate: returnValues.task.fromDate,
                            toDate: returnValues.task.toDate,
                            createdBy: returnValues.task.createdBy,
                            assignees: returnValues.task.assignees,
                            description: returnValues.task.description
                        }
                    }).then(() => {
                        sectionRefs.value.at(currentHoveredSection).onChangeTaskSection(event, returnValues.task, draggedTaskObject.value, returnValues.startDragPosX);
                        sectionRefs.value.at(currentHoveredSection).onCreateTask(returnValues.task);
                    });
                }
            }
        }

        sectionRefs.value.at(currentHoveredSection).mouseMoveEvent(event);

        for(let i = 0; i < sections.value.length; i++)
            sectionRefs.value.at(i).mouseMoveOverCalendar(event);
    }
    
    if(draggingCalendar.value) {
        calendarDragPos.value = event.screenX - startDragPosX.value + relativeDragPos.value;
        
        datesOffset.value = calendarDragPos.value % columnWidth;
        weekOffset.value = calendarDragPos.value % (columnWidth*7);
        weekendOffset.value = weekOffset.value - (todayWeekDay.value - 2) * columnWidth;
        datesPos.value = calendarDragPos.value / columnWidth < 0 ? Math.ceil(calendarDragPos.value / columnWidth) : Math.floor(calendarDragPos.value / columnWidth);

        if(datesPos.value > leftTaskOffset) {
            leftTaskOffset += 60;
            for(let i = 0; i < sections.value.length; i++)
                sectionRefs.value.at(i).loadTasks(leftTaskOffset, rightTaskOffset);
        }
        else if(datesPos.value < -rightTaskOffset) {
            rightTaskOffset += 60;
            for(let i = 0; i < sections.value.length; i++)
                sectionRefs.value.at(i).loadTasks(leftTaskOffset, rightTaskOffset);
        }
    }
}

async function mouseUpEvent(e: MouseEvent) {
    if(e.button === 0) {
        for(let i = 0; i < sections.value.length; i++)
            sectionRefs.value.at(i).mouseUpEvent(currentHoveredSection);
    }

    if(draggingCalendar.value) {
        relativeDragPos.value = calendarDragPos.value;
        draggingCalendar.value = false;     
    }
}


// task events

function CDateToTimestamp(date: CDate) {
    return new Date(date.year, date.month - 1, date.day).getTime();
}

async function onSectionChange(index: number) {
    currentHoveredSection = index;
}

async function onEditTask(task: Task) {
    if(task)
        sectionRefs.value.at(task.sectionIndex).onEditTask(task);    
}

async function onCreatedTask(task: Task) {
    if(task)
        sectionRefs.value.at(task.sectionIndex).onCreateTask(task);
}

async function onCloseEdit() {
    sectionRefs.value.at(currentHoveredSection).onCloseEdit();
}

async function taskEdit(task: Task) {
    if(taskEditor.value)
    {
        if(task) {
            taskEditor.value.showEditor();
            taskEditor.value.onTaskChange(task);
        }
        else {
            taskEditor.value.hideEditor();
            for(let i = 0; i < sections.value.length; i++)
                sectionRefs.value.at(i).onCloseEdit(currentHoveredSection);
        }
    }
}

async function inactiveTaskEdit(task: InactiveTask) {
    if(taskEditor.value)
    {
        if(task) {
            taskEditor.value!.showEditor();
            taskEditor.value!.onInactiveTask(task);
        }
        else {
            taskEditor.value!.hideEditor();
            for(let i = 0; i < sections.value.length; i++)
                sectionRefs.value.at(i).onCloseEdit(currentHoveredSection);
        }
    }
}

async function editResizeTask(task: Task, dateFrom: string, dateTo: string) {
    // if value was cleared in edit calendar or task problem
    if (!task || dateFrom.length < 1 || dateTo.length < 1) return;

    const dateFromFormat = dateFrom.split('-');
    const dateToFormat = dateTo.split('-');
    
    let prevFromDate = task.fromDate;
    let prevToDate = task.toDate;
    let fromDate: CDate = { day: parseInt(dateFromFormat[2]), month: parseInt(dateFromFormat[1]), year: parseInt(dateFromFormat[0]) };
    let toDate: CDate = { day: parseInt(dateToFormat[2]), month: parseInt(dateToFormat[1]), year: parseInt(dateToFormat[0]) };

    if(CDateToTimestamp(fromDate) > CDateToTimestamp(toDate)) {
        task.fromDate = toDate;
        task.toDate = fromDate;
    }
    else {
        task.fromDate = fromDate;
        task.toDate = toDate;
    }

    sectionRefs.value.at(currentHoveredSection).onEditResizeTask(task, prevFromDate, prevToDate);
}

async function onDraggedTaskChange(draggedTask: DraggedTask) {
    draggedTaskObject.value = draggedTask;
}

//


onMounted(() => {
    const handleResize = () => screenSize.value = getScreenSize();
    window.addEventListener('resize', handleResize);
    handleResize();
});

</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null' && pfps && profiles && profile && sections && sections.length > 0" class="relative flex flex-col w-full h-screen overflow-x-hidden"
    :style="{backgroundImage: `repeating-linear-gradient(to right, ${tw.colors.white} ${weekendOffset}px, ${tw.colors.white} ${2+weekendOffset}px, ${tw.colors.gray[50]} ${2+weekendOffset}px, ${tw.colors.gray[50]} ${112+weekendOffset}px, ${tw.colors.white} ${112+weekendOffset}px, ${tw.colors.white} ${392+weekendOffset}px)`}">
        <div class="flex flex-col h-screen">
            <!-- Top date panel -->
            <CalendarDates :datesOffset = "datesOffset" :columnWidth = "columnWidth" :screenSizeWidth = "screenSize.width" :datesPos = "datesPos" />
            <!-- Task edit menu -->
            <CalendarTaskEdit ref="taskEditor" @taskEdited="onEditTask" @createdTask="onCreatedTask" @closeEdit="onCloseEdit" @editResizeTask="editResizeTask" :session-token="sessionToken" :profiles="profiles!" :profile="profile" :pfps="pfps"/>

            <div class="relative flex-grow w-full overflow-y-auto cursor-grab"
                @mousedown="mouseDownEvent" @mousemove="mouseMoveEvent" @mouseup="mouseUpEvent"
                :class="{ 'cursor-grabbing': draggingCalendar || draggedTaskObject }">
                <!-- Calendar -->
                <div class="w-full overflow-x-hidden">
                    <div v-for="(section, index) in sections">
                        <CalendarSection @mouseover="onSectionChange(index)" :ref="sectionRefs.set" @onDraggedTaskChange="onDraggedTaskChange" @taskEdit="taskEdit" @inactiveTaskEdit="inactiveTaskEdit" @showSectionContextMenu="onShowSectionContextMenu" @showTaskContextMenu="onShowTaskContextMenu" :section="section" :columnWidth="columnWidth" :datesPos="datesPos" :calendarDragPos="calendarDragPos" :profile="profile" :datesOffset="datesOffset"/>            
                    </div>
                    <button v-if="sections.length < 4 && profile.role === 'admin'" @click="addNewSection" @mouseover="disableCreatingTasks = true" @mouseleave="disableCreatingTasks = false" class="flex justify-center items-center w-40 mt-2 mb-8 p-4 text-white font-bold bg-red-400 hover:bg-red-500 rounded-r-lg select-none shadow-[0_0px_20px_-10px_rgba(0,0,0,0.3)]">New section</button>
                </div>
            </div>
        </div>

        <!-- Dragged ghost task -->
        <div v-if="draggedTaskObject !== undefined" class="absolute z-20 pointer-events-none h-11 mb-0.5 rounded-md overflow-hidden" :style="{ backgroundColor: draggedTaskObject.color, left: draggedTaskObject.left + 'px', top: draggedTaskObject.top + 'px', width: draggedTaskObject.width + 'px' }">
            <div class="size-full">
                <div class="absolute size-full p-1 pl-2">
                    <div class="relative size-full">
                        <div class="flex items-center gap-1 h-full">
                            <div v-if="draggedTaskObject.status !== 'No status'">{{ draggedTaskObject.status.slice(0,2) }}</div>
                            <h3 class="font-semibold leading-none whitespace-nowrap select-none" :class="{'text-white': !(parseInt(draggedTaskObject.color.substring(1), 16) > 0xffffff / 2)}">{{ draggedTaskObject.name }}</h3>
                        </div>
                        <div class="absolute flex items-center h-full right-1 top-0">
                            <div class="relative size-8 select-none">
                                <div v-for="num in 3">
                                    <!--add icons-->
                                </div>
                            </div>
                        </div>                
                    </div>
                </div>
            </div>
        </div>
        
        <CalendarSectionContextMenu v-if="profile.role === 'admin' && showSectionContextMenu" @mouseover="mouseOverContextMenu = true" @mouseleave="mouseOverContextMenu = false" @onRenameSection="onRenameSection" @onDeleteSection="onDeleteSection" @onCloseSectionContextMenu="onCloseSectionContextMenu" :x="contextMenuX" :y="contextMenuY" :profile="profile"/>
        <CalendarTaskContextMenu v-if="profile.role === 'admin' && showTaskContextMenu" @mouseover="mouseOverContextMenu = true" @mouseleave="mouseOverContextMenu = false" @onDuplicateTask="onDuplicateTask" @onDeleteTask="onDeleteTask" :x="contextMenuX" :y="contextMenuY"/>
    </div>
</template>

<style scoped>

</style>
