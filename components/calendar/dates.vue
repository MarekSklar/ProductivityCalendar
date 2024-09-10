<script lang="ts" setup>
const props = defineProps({
  Title: String,
  datesOffset: Number,
  columnWidth: Number,
  screenSizeWidth: Number,
  datesPos: Number
});

function getDate(dateNum: number) {
  return new Date(new Date().getTime() + dateNum * 86400000);
}

function generateDate(dateNum: number) {
  const date = getDate(dateNum);

  const newDateNum = date.getDate();
  let day = getWeekDay(date.getDay());

  return day + " " + newDateNum;
}
</script>

<template>
  <div class="py-4 shadow-md">
    <div class="px-4">
      <h1 class="font-bold text-gray-700">{{ props.Title! }}</h1>
    </div>
    <div class="relative flex justify-center w-full py-3 overflow-hidden">
      <p class="py-0.5 opacity-0">Dates</p>
      <div class="absolute z-10 flex" :style="{left: props.datesOffset! - 5 * props.columnWidth! + 'px'}">
        <p v-for="date in Math.ceil(props.screenSizeWidth! * 0.02 + 10)" class="w-14 py-0.5 text-center rounded-md text-gray-500 font-bold"
        :class="{'text-gray-300': getDate(date - props.datesPos! - 9).getDay() === 0 || getDate(date - props.datesPos! - 9).getDay() === 6, 'bg-red-100': !(date - props.datesPos! - 9), 'text-gray-900': !(date - props.datesPos! - 9)}">
          {{ generateDate(date - props.datesPos! - 9) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style>

</style>