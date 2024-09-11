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

function getDateNum(date: number) {
  return date - props.datesPos! - 9;
}

function generateDate(dateNum: number) {
  const date = getDate(dateNum);

  const newDateNum = date.getDate();
  let day = getWeekDay(date.getDay());

  return day + " " + newDateNum;
}

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  var dayOfYear = ((today.getTime() - onejan.getTime() + 86400000)/86400000);
  return Math.ceil(dayOfYear/7);
};
</script>

<template>
  <div class="py-4 shadow-md">
    <div class="relative flex justify-center w-full pt-16 pb-2 overflow-hidden">
      <p class="py-0.5 opacity-0">Dates</p>
      <div class="absolute z-10 flex" :style="{left: props.datesOffset! - 5 * props.columnWidth! + 'px'}">
        <div v-for="date in Math.ceil(props.screenSizeWidth! / props.columnWidth! + 20)" class="w-14 text-center text-gray-500 font-bold">
          <!-- week number -->
          <p v-if="getDate(getDateNum(date)).getMonth() === 0 && getDate(getDateNum(date)).getDate() === 1" class="absolute -top-16">{{ getDate(getDateNum(date)).getFullYear() }}</p>
          <p v-if="getDate(getDateNum(date)).getDate() === 1" class="absolute -top-10">{{ getDate(getDateNum(date)).toLocaleString('default', { month: 'long' }) }}</p>
          <p v-if="getDate(getDateNum(date)).getDay() === 1" class="absolute -top-5">{{ getDate(getDateNum(date)).getWeek() }}</p>
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