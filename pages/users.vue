<script setup lang="ts">

const { data } = await useFetch('/api/profiles/profilesList', { method: 'post' });
const profiles = data as Ref<Profile[]>;

let pfpMap = new Map<string, string>();

function getProfilePics() {
    if (profiles.value === null) return;

    // xdd reseni
    let iMax = profiles.value.length;

    let i = 0;
    profiles.value.forEach(async (profile) => {
        if(!pfpMap.has(profile.uuid))
        {
            const pfp: string = await $fetch('/api/getImage', { method: 'post', body: { path: profile?.pfpPath48 }});
            pfpMap.set(profile.uuid, pfp);
        }        
        i++;
        if(i === iMax)
        {
            await refreshNuxtData();
        }
    });
}

onMounted(async () => {
    getProfilePics();
});
</script>

<template>
    <div>
        <div v-for="profile in profiles">
            <img v-if="pfpMap.has(profile.uuid)" :src="'data:image/jpg;base64,' + pfpMap.get(profile.uuid)" class="object-cover">
            <div>
                <h3>{{ profile.name }}</h3>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>