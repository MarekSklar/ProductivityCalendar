<script setup lang="ts">

const sessionToken = useCookie<string>('sessionToken');

const { data: profileData } = await useFetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken.value }});
const profile = profileData.value?.at(0);

let pfpPath = '';
if(profile)
    pfpPath = profile.pfpPath256;

const { data: pfp } = await useFetch('/api/getImage', { method: 'post', body: { path: pfpPath }});
const pfpFormat = pfpPath.split('.').pop();

</script>

<template>
    <div v-if="sessionToken && sessionToken !== 'null'">
        <div>
            <img :src="'data:image/' + pfpFormat + ';base64,' + pfp" width="256" height="256" class="size-64 rounded-full object-cover"/>
            <h2 class="text-3xl text-gray-800">{{ profile.name }}</h2>
            <p>E-Mail: {{ profile.email }}</p>
        </div>
    </div>
    <div v-else>
        <div>
            <h2>You are not logged in.</h2>
            <div class="p-4 bg-gray-500 text-white">
                <NuxtLink to="/login">Login</NuxtLink>
            </div>
        </div>
    </div>
</template>