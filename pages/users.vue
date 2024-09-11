<script setup lang="ts">

const sessionToken = useCookie<string>('sessionToken');
if (!sessionToken.value || sessionToken.value === null) navigateTo('/invalidSession');

const { data } = await useFetch('/api/profiles/profilesList', { method: 'post' });
const profiles = data as Ref<Profile[]>;

const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });

</script>

<template>
    <div class="simpleCardBox py-10">
        <div class="card w-11/12 max-h-[100%] h-fit px-6 py-8">
            <div class="card gap-0 size-full p-3 shadow-none overflow-auto overflow-x-hidden">
                <div v-for="profile in profiles" class="flex items-center gap-3 w-full p-4 rounded-md odd:bg-gray-100">
                    <img v-if="pfps![profile.uuid]" :src="'data:image/jpg;base64,' + pfps![profile.uuid]" class="size-9 rounded-full object-cover">
                    <div class="flex justify-between w-full">
                        <h3>{{ profile.name }}</h3>
                        <SvgMore />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>