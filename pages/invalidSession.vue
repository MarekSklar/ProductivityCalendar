<script lang="ts" setup>

</script>

<template>
  <div class="simpleCardBox gap-6">
    <!-- login redirect -->
    <div class="card">
      <h2>Already have an account?</h2>
      <NuxtLink to="/login">
        <button class="px-6 py-3 rounded-md bg-green-200">Login</button>
      </NuxtLink>
    </div>
    <!-- register redirect -->
    <div class="card gap-8 px-20 py-12">
      <h2>Don't have an account?</h2>
      <NuxtLink to="/register">
        <button class="px-6 py-3 rounded-md bg-green-200">Create one</button>
      </NuxtLink>
    </div>
  </div>
</template>

<style>

</style>