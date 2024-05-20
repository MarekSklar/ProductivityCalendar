<script setup lang="ts">
const Title = "Timeline Title";

const startDragPos = ref(0);
const relativeDragPos = ref(0);
const tempDragPos = ref(0);

const draggingCalendar = ref(false);
const draggingTask = ref(false);
const draggingTaskExtension = ref(false);

const datesOffset = ref(0);
const datesPos = ref(0);


const screenSize = ref({width: 1920, height: 1080});


// start dragging
function startCalendarDragging(event: MouseEvent) {
    draggingCalendar.value = true;
    startDragPos.value = event.screenX;
}

function startTaskDragging() {
    draggingTask.value = true;
}

function startTaskExtensionDragging() {
    draggingTaskExtension.value = true;
}

// end dragging
function endDragging() {
    switch (true) {

        case draggingCalendar.value:
            draggingCalendar.value = false;
            relativeDragPos.value = tempDragPos.value;

        case draggingTask.value:
            draggingTask.value = false;

        case draggingTaskExtension.value:
            draggingTaskExtension.value = false;
    }
}

// dragging
function moveCalendarComponents(event: MouseEvent) {
    // disable default dragging
    event.preventDefault ? event.preventDefault() : event.returnValue = false;

    // move calendar on drag
    if (!event.buttons) return;

    switch (true) {

        case draggingTaskExtension.value:
            console.log("task extension dragging");
            break;

        case draggingTask.value:
            console.log("task dragging");
            break;

        case draggingCalendar.value:
            tempDragPos.value = event.screenX - startDragPos.value + relativeDragPos.value;

            datesOffset.value = tempDragPos.value % 56;
            datesPos.value = tempDragPos.value / 56 < 0 ? Math.ceil(tempDragPos.value / 56) : Math.floor(tempDragPos.value / 56);

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
    <div class="flex flex-col w-full h-screen">
        <div class="py-4 shadow-md">
            <div class="px-4">
                <h1>{{ Title }}</h1>
            </div>
            <div class="relative flex justify-center w-full py-3 overflow-hidden">
                <p class="py-0.5 opacity-0">Dates</p>
                <div class="absolute flex" :style="{left: datesOffset - 5 * 56 + 'px'}">
                    <p v-for="date in Math.ceil(screenSize.width * 0.02 + 10)" class="w-14 py-0.5 text-center rounded-md text-gray-500 font-bold"
                    :class="{'bg-red-100': !(date - datesPos - 9), 'text-gray-900': !(date - datesPos - 9)}">
                        {{ generateDate(date - datesPos - 9) }}
                    </p>
                </div>
            </div>
        </div>
        <div class="flex-auto min-w-full mt-4">
            <div>
                
            </div>
            <div class="">
                <div @mousedown="startCalendarDragging" @mousemove="moveCalendarComponents" @mouseleave="endDragging" @mouseup="endDragging" class="grid overflow-hidden cursor-grab select-none" :class="{'cursor-grabbing': draggingCalendar}">
                    <div v-for="row in 10" class="relative h-11 mb-0.5 bg-white">
                        <CalendarTask
                            @start-task-extension-dragging="startTaskExtensionDragging" @start-task-dragging="startTaskDragging"
                            :row="row" :tempDragPos="tempDragPos"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>