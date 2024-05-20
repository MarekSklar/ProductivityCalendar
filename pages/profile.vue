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
    <main v-if="sessionToken">
        <img :src="'data:image/' + pfpFormat + ';base64,' + pfp" width="256" height="256" class="m-1.5"/>

        Name: {{ profile.name }} <br>
        E-Mail: {{ profile.email }}<br>        
    </main>    
</template>