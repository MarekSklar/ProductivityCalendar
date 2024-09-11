<script setup lang="ts">

const Title = "Timeline Title";

let pending = true;


const sessionToken = useCookie<string>('sessionToken');
if (!sessionToken.value || sessionToken.value === null) navigateTo('/invalidSession');
const { data: profileData } = await useFetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken.value }});
const profile = profileData.value?.at(0);
const startDragPosX = ref(0);
const relativeDragPos = ref(0);
const calendarDragPos = ref(0);

let sections = ref(null); // make array
let taskEditor = ref(null);
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
const weekendOffset = ref(weekOffset.value - (todayWeekDay.value - 2) * columnWidth);

// mouse events

async function mouseDownEvent(event: MouseEvent) { // get rid of Dragging enum
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

    if(sections.value)
        sections.value!.mouseMoveEvent(event.pageX, event.pageY);

    if(draggingCalendar) {
        calendarDragPos.value = event.screenX - startDragPosX.value + relativeDragPos.value;
        
        datesOffset.value = calendarDragPos.value % columnWidth;
        weekOffset.value = calendarDragPos.value % (columnWidth*7);
        weekendOffset.value = weekOffset.value - (todayWeekDay.value - 2) * columnWidth;
        datesPos.value = calendarDragPos.value / columnWidth < 0 ? Math.ceil(calendarDragPos.value / columnWidth) : Math.floor(calendarDragPos.value / columnWidth);        
    }
}

async function mouseUpEvent() {
    if(sections.value)
        sections.value!.mouseUpEvent();

    if(draggingCalendar) {
        relativeDragPos.value = calendarDragPos.value;
        draggingCalendar = false;     
    }
}

// task events

async function onEditTask(task: Task) {
    if(task && sections.value)
        sections.value!.onEditTask(task);    
}

function taskEdit(task: Task) {
    if(taskEditor.value)
    {
        if(task) {
            taskEditor.value!.showEditor();
            taskEditor.value!.onTaskChange(task);
        }
        else {
            taskEditor.value!.hideEditor();
        }
    }
}

function inactiveTaskEdit(task: InactiveTask) {
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

function onDraggedTaskChange(draggedTask: DraggedTask) {
    draggedTaskObject.value = draggedTask;
}

onMounted(() => {
    const handleResize = () => screenSize.value = getScreenSize();
    window.addEventListener('resize', handleResize);
    handleResize();
});

</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null'" class="flex flex-col w-full h-screen">
        <!-- Top date panel -->
        <CalendarDates :Title = "Title" :datesOffset = "datesOffset" :columnWidth = "columnWidth" :screenSizeWidth = "screenSize.width" :datesPos = "datesPos" />

        <!-- Calendar -->
        <div class="relative flex-auto min-w-full h-full">
            <CalendarTaskEdit ref="taskEditor" @taskEdited="onEditTask"/>
            <div @mousedown="mouseDownEvent" @mousemove="mouseMoveEvent" @mouseup="mouseUpEvent"
                class="w-full h-full overflow-x-hidden overflow-y-auto cursor-grab"
                :style="{backgroundImage: `repeating-linear-gradient(to right, #fff ${weekendOffset}px, #fff ${2+weekendOffset}px, #e7e7e7 ${2+weekendOffset}px, #e7e7e7 ${112+weekendOffset}px, #fff ${112+weekendOffset}px, #fff ${392+weekendOffset}px)`}"
                :class="{ 'cursor-grabbing': draggingCalendar }">
                <CalendarSection @onDraggedTaskChange="onDraggedTaskChange" @taskEdit="taskEdit" @inactiveTaskEdit="inactiveTaskEdit" ref="sections" :columnWidth="columnWidth" :datesPos="datesPos" :calendarDragPos="calendarDragPos" :profile="profile"/>            
            </div>
        </div>

        <!-- Dragged ghost task -->
        <div v-if="draggedTaskObject !== undefined" class="absolute z-10 pointer-events-none h-11 mb-0.5 rounded-md" :style="{ backgroundColor: draggedTaskObject.color, left: draggedTaskObject.left + 'px', top: draggedTaskObject.top + 'px', width: draggedTaskObject.width + 'px' }">
            <div class="size-full">
                <div class="absolute size-full p-1 pl-2">
                    <div class="relative size-full">
                        <div class="flex items-center h-full">
                            <div v-if="draggedTaskObject.status !== 'No status'">{{ draggedTaskObject.status.slice(0,2) }}</div>
                            <h3 class="leading-none select-none">{{ draggedTaskObject.name }}</h3>
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
