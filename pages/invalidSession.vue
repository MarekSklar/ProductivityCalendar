<script lang="ts" setup>
definePageMeta({
  layout: false
});
</script>

<template>
  <div class="simpleCardBox gap-6">
    
    <!-- login redirect -->
    <div class="card">
      <h2 class="header">Already have an account?</h2>
      <NuxtLink to="/login">
        <button class="primaryButton">Login</button>
      </NuxtLink>
    </div>

    <!-- register redirect -->
    <div class="card gap-8 px-20 py-12">
      <h2 class="header">Don't have an account?</h2>
      <p class="text-center py-3">Ask your supervisor and they will create you one.</p>
    </div>
  </div>
</template>

<style>

</style>