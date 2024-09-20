<script lang="ts" setup>

const emit = defineEmits(["changeShowSections", "openSidebar"]);

const props = defineProps({
  Title: String,
  datesOffset: Number,
  columnWidth: Number,
  screenSizeWidth: Number,
  datesPos: Number,
  showSectionsCookieValue: Boolean
});

const showSections = ref(props.showSectionsCookieValue);

function getDate(dateNum: number) {
  return new Date(new Date().getTime() + dateNum * 86400000);
}

function getDateNum(date: number) {
  return date - props.datesPos! - 9;
}

function generateDate(dateNum: number) {
  const date = getDate(dateNum);

  const newDateNum = date.getDate();
  let day = getWeekDay(date.getDay());

  return day + " " + newDateNum;
}

function changeShowSections() {
  let showSectionsCookie = useCookie<boolean>("showSections");
  showSectionsCookie.value = !showSectionsCookie.value;
  showSections.value = showSectionsCookie.value;
  emit("changeShowSections", showSections.value);
}

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  var dayOfYear = ((today.getTime() - onejan.getTime() + 86400000)/86400000);
  return Math.ceil(dayOfYear/7);
};

</script>

<template>
  <div class="relative w-full shadow-md bg-white select-none">
    <div class="absolute bottom-0 z-[60] translate-y-full flex gap-2 h-12 p-3 bg-white rounded-br-xl shadow-md">
      <button @click="emit('openSidebar')" class="size-full bg-white-400">
        <SvgNavigation class="size-full fill-gray-600 hover:fill-black" />
      </button>
      <button @click="changeShowSections" class="size-full bg-white-400">
        <SvgSidebar v-if="showSections" class="size-full fill-black hover:fill-gray-600" />
        <SvgSidebar v-else class="size-full fill-gray-600 hover:fill-black" />
      </button>
    </div>

    <div class="relative flex justify-center w-full pt-10 pb-12 overflow-hidden">
      <div class="absolute z-10 flex" :style="{left: props.datesOffset! - 5 * props.columnWidth! + 'px'}">
        <div v-for="date in Math.ceil(props.screenSizeWidth! / props.columnWidth! + 20)" class="relative w-14 text-center text-gray-500 font-bold">
          <!-- month + year -->
          <div v-if="getDate(getDateNum(date)).getDate() === 1" class="absolute -top-6 -left-12 flex flex-col items-center w-40 ">
            <p class="text-xs text-red-400">{{ getDate(getDateNum(date)).toLocaleString('default', { month: 'long' }) + (!getDate(getDateNum(date)).getMonth() ? ("\n" + getDate(getDateNum(date)).getFullYear()) : "") }}</p>
            <SvgTriangleDown class="size-5 -mt-1 fill-red-300" />
          </div>
          <!-- week number -->
           <div v-if="getDate(getDateNum(date)).getDay() === 1" class="absolute -top-2 -left-2 flex flex-col items-center w-4">
            <p class="text-xs text-gray-600 font-extralight">{{ getDate(getDateNum(date)).getWeek() }}</p>
            <div class="w-1px h-4 bg-gray-300"></div>
           </div>
          <!-- date -->
          <p :class="{
            'text-gray-300': getDate(getDateNum(date)).getDay() === 0 || getDate(getDateNum(date)).getDay() === 6,
            'bg-red-300': !(getDateNum(date)),
            'text-white': !(getDateNum(date))}"
            class="py-1 rounded-md">
            {{ generateDate(getDateNum(date)) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>