<script lang="ts" setup>

const emit = defineEmits(['toggleDelete', 'refetchProfiles']);

const props = defineProps({
  deletedProfile: Object,
  profiles: Object
});

const pFailed = ref("");

function deleteProfile() {
  if (props.deletedProfile?.role === "admin") {pFailed.value = "You can't delete users with an admin role."; return;}
  fetchDeleteProfile(props.deletedProfile?.uuid);
  emit('refetchProfiles');
  emit('toggleDelete');
}
</script>

<template>
  <div @click="emit('toggleDelete')" class="absolute w-screen h-screen bg-black bg-opacity-20"></div>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div class="card background">
      <div>
        <h3 class="header font-semibold">User <span class="font-bold">{{ props.deletedProfile?.name }}</span> will be <br> deleted permanently.</h3>
      </div>
      <div class="flex gap-4">
        <button @click="deleteProfile" class="primaryButton w-28">Confirm</button>
        <button @click="emit('toggleDelete')" class="secondaryButton w-28">Cancel</button>
      </div>
      <p v-if="pFailed.length > 0" class="-mt-4 text-center text-red-600">{{ pFailed }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>