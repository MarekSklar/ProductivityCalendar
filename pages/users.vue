<script setup lang="ts">

const sessionToken = useCookie<string>('sessionToken');
if (!sessionToken.value || sessionToken.value === null) navigateTo('/invalidSession');

const { data } = await useFetch('/api/profiles/profilesList', { method: 'post' });
const profiles = data as Ref<Profile[]>;

const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });

</script>

<template>
    <div>
        <div v-for="profile in profiles" class="flex items-center gap-3">
            <img v-if="pfps![profile.uuid]" :src="'data:image/jpg;base64,' + pfps![profile.uuid]" class="rounded-full object-cover">
            <div>
                <h3>{{ profile.name }}</h3>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>