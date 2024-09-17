<script lang="ts" setup>
  const props = defineProps({
    x: Number,
    y: Number
  });

  const emit = defineEmits(["onRenameSection", "onDeleteSection"]);
</script>

<template>
  <div class="background fixed z-50 min-w-36 px-3 py-3 rounded-md shadow-md" :style="{ left: props.x + 'px', top: props.y + 'px' }">
    <h3 class="text-sm text-gray-800 mb-3 px-2">Section edit</h3>
    <div class="flex flex-col text-sm font-semibold">
    <button @click="emit('onRenameSection', 'haha')" class="line">
      <SvgDuplicate />
      Rename
    </button>
    <button @click="emit('onDeleteSection')" class="line text-red-500 hover:!bg-red-50">
      <SvgDelete class="fill-red-500" />
      Delete
    </button>
    </div>
  </div>
</template>

<style scoped>
svg {
  @apply size-4;
}

.line {
  @apply flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100;
}
</style>