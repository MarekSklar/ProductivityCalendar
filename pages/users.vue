<script setup lang="ts">

const { data } = await useFetch('/api/profiles/profilesList', { method: 'post' });
const profiles = data as Ref<Profile[]>;

interface Pfp {
    uuid: string;
    img: string;
}

interface PfpObject {
    [uuid: string]: string;
}

const pfpsObjectified = ref({} as PfpObject);
const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });
for (let i = 0; i < pfps.value!.length; i++) {
    const pfp: Pfp = pfps.value![i];
    pfpsObjectified.value[pfp.uuid] = pfp.img;
}

</script>

<template>
    <div>
        <div v-for="profile in profiles" class="flex items-center gap-3">
            <img v-if="pfpsObjectified[profile.uuid]" :src="'data:image/jpg;base64,' + pfpsObjectified[profile.uuid]" class="rounded-full object-cover">
            <div>
                <h3>{{ profile.name }}</h3>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>