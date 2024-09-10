<script lang="ts" setup>

</script>

<template>
  <div class="flex items-center justify-center gap-6 w-screen h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center gap-8 px-20 py-12 rounded-xl shadow-lg bg-white dark:bg-gray-800 dark:shadow-md">
      <h2>Already have an account?</h2>
      <NuxtLink to="/login">
        <button class="px-6 py-3 rounded-md bg-green-200">Login</button>
      </NuxtLink>
    </div>
    <div class="flex flex-col items-center gap-8 px-20 py-12 rounded-xl shadow-lg bg-white dark:bg-gray-800 dark:shadow-md">
      <h2>Don't have an account?</h2>
      <NuxtLink to="/register">
        <button class="px-6 py-3 rounded-md bg-green-200">Create one</button>
      </NuxtLink>
    </div>
  </div>
</template>

<style>

</style>