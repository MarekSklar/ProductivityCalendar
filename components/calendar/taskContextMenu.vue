<script lang="ts" setup>
  const props = defineProps({
    task: Object as PropType<Task>,
    x: Number,
    y: Number
  });

  const emit = defineEmits(["onDuplicateTask", "onDeleteTask"]);
</script>

<template>
  <div class="fixed z-50 bg-white" :style="{ left: props.x + 'px', top: props.y + 'px' }">
    <ul>
      <button @click="emit('onDuplicateTask')">Duplicate</button><br>
      <button @click="emit('onDeleteTask')">Delete</button>
    </ul>
  </div>
</template>
