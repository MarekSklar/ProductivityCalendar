<script lang="ts" setup>

const emit = defineEmits(["onRenameSection", "onDeleteSection", "onCloseSectionContextMenu"]);

const props = defineProps({
  x: Number,
  y: Number,
  profile: Object as PropType<Profile>
});

const renaming = ref(false);
const renamedTo = ref("");

function handleRenaming() {
  renaming.value = true;
}
</script>

<template>
  <div v-if="profile?.role === 'admin'" class="background fixed z-50 min-w-36 p-3 rounded-md shadow-md" :style="{ left: props.x + 'px', top: props.y + 'px' }">
    <div v-if="renaming" @keydown.enter="emit('onRenameSection', renamedTo)" @keydown.esc="emit('onCloseSectionContextMenu')" class="flex flex-col items-left gap-4 p-2">
      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">New section name</label>
        <input v-model="renamedTo" class="px-2 outline outline-1 outline-gray-400 rounded-md w-36">
      </div>
      <div>
        <button @click="emit('onRenameSection', renamedTo)" class="line w-full">
          <SvgEdit />
          Rename
        </button>
        <button @click="emit('onCloseSectionContextMenu')" class="line w-full text-red-500 hover:!bg-red-50">
          <SvgEdit class="fill-red-500" />
          Cancel
        </button>
      </div>
    </div>
    <div v-else>
      <h3 class="text-sm text-gray-800 mb-3 px-2">Section edit</h3>
      <div class="flex flex-col text-sm font-semibold">
      <button @click="handleRenaming()" class="line">
        <SvgEdit />
        Rename
      </button>
      <button @click="emit('onDeleteSection')" class="line text-red-500 hover:!bg-red-50">
        <SvgDelete class="fill-red-500" />
        Delete
      </button>
      </div>
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