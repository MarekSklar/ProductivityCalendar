<script setup lang="ts">
function toggleSidebar() {
    sidebarIsActive.value = !sidebarIsActive.value;
}

const sidebarIsActive = ref(false);

provide('toggleSidebar', toggleSidebar);
</script>

<template>
    <DefaultSidebar @toggleSidebar = 'toggleSidebar' :sidebarIsActive="sidebarIsActive" />
    <slot />
</template>

<style scoped>
</style>