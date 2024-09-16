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
let draggingCalendar: boolean = false;

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
    await $fetch('/api/sections/sectionAdd', {
        method: 'post',
        body: {
            name: "New section",
            sectionIndex: sections.value.length
        }
    }).then((section) => { 
        sections.value.push(section as Section);
    }).catch(err => {});
}

//


// mouse events

async function mouseDownEvent(event: MouseEvent) {
    if (event.button === 1) {
        startDragPosX.value = event.screenX;
        draggingCalendar = true;
    }
}

function mouseMoveEvent(event: MouseEvent) {
    // disable default dragging
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    // move calendar on drag
    if (!event.buttons) return;

    sectionRefs.value.at(currentHoveredSection).mouseMoveEvent(event.pageX, event.pageY);

    if(draggingCalendar) {
        calendarDragPos.value = event.screenX - startDragPosX.value + relativeDragPos.value;
        
        datesOffset.value = calendarDragPos.value % columnWidth;
        weekOffset.value = calendarDragPos.value % (columnWidth*7);
        weekendOffset.value = weekOffset.value - (todayWeekDay.value - 2) * columnWidth;
        datesPos.value = calendarDragPos.value / columnWidth < 0 ? Math.ceil(calendarDragPos.value / columnWidth) : Math.floor(calendarDragPos.value / columnWidth);        
    }
}

async function mouseUpEvent() {
    sectionRefs.value.at(currentHoveredSection).mouseUpEvent();

    if(draggingCalendar) {
        relativeDragPos.value = calendarDragPos.value;
        draggingCalendar = false;     
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
        sectionRefs.value.at(currentHoveredSection).onEditTask(task);    
}

async function onCreatedTask(task: Task) {
    if(task)
        sectionRefs.value.at(currentHoveredSection).onCreateTask(task);
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
        }
    }
}

async function editResizeTask(task: Task, dateFrom: string, dateTo: string) {
    if(task) {
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
    <div v-if="sessionToken && sessionToken !== 'null' && pfps && profiles && profile && sections && sections.length > 0" class="flex flex-col w-full h-screen"
    :style="{backgroundImage: `repeating-linear-gradient(to right, ${tw.colors.white} ${weekendOffset}px, ${tw.colors.white} ${2+weekendOffset}px, ${tw.colors.gray[50]} ${2+weekendOffset}px, ${tw.colors.gray[50]} ${112+weekendOffset}px, ${tw.colors.white} ${112+weekendOffset}px, ${tw.colors.white} ${392+weekendOffset}px)`}">
        <!-- Top date panel -->
        <CalendarDates :datesOffset = "datesOffset" :columnWidth = "columnWidth" :screenSizeWidth = "screenSize.width" :datesPos = "datesPos" />

        <div class="relative flex-auto min-w-full h-full">
            <!-- Task edit menu -->
            <CalendarTaskEdit ref="taskEditor" @taskEdited="onEditTask" @createdTask="onCreatedTask" @closeEdit="onCloseEdit" @editResizeTask="editResizeTask" :session-token="sessionToken" :profiles="profiles!" :profile="profile" :pfps="pfps"/>
            <!-- Calendar -->
            <div @mousedown="mouseDownEvent" @mousemove="mouseMoveEvent" @mouseup="mouseUpEvent"
                class="w-full h-full overflow-x-hidden overflow-y-auto cursor-grab"
                :class="{ 'cursor-grabbing': draggingCalendar }">
                <div v-for="(section, index) in sections">
                    <CalendarSection @mouseover="onSectionChange(index)" :ref="sectionRefs.set" @onDraggedTaskChange="onDraggedTaskChange" @taskEdit="taskEdit" @inactiveTaskEdit="inactiveTaskEdit" :sectionIndex="index" :name="sections[index].name" :columnWidth="columnWidth" :datesPos="datesPos" :calendarDragPos="calendarDragPos" :profile="profile"/>            
                </div>
            </div>
        </div>

        <!-- Dragged ghost task -->
        <div v-if="draggedTaskObject !== undefined" class="absolute z-10 pointer-events-none h-11 mb-0.5 rounded-md" :style="{ backgroundColor: draggedTaskObject.color, left: draggedTaskObject.left + 'px', top: draggedTaskObject.top + 'px', width: draggedTaskObject.width + 'px' }">
            <div class="size-full">
                <div class="absolute size-full p-1 pl-2">
                    <div class="relative size-full">
                        <div class="flex items-center h-full">
                            <div v-if="draggedTaskObject.status !== 'No status'">{{ draggedTaskObject.status.slice(0,2) }}</div>
                            <h3 class="font-semibold leading-none select-none" :class="{'text-white': !(parseInt(draggedTaskObject.color.substring(1), 16) > 0xffffff / 2)}">{{ draggedTaskObject.name }}</h3>
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
    </div>
</template>

<style scoped>

</style>
