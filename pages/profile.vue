<script setup lang="ts">

const sessionToken = useCookie<string>('sessionToken');
const { data: profileData } = await useFetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken.value }});
const profile = profileData.value?.at(0);

</script>

<template>
    <main>
        <img :src="profile.pfpPath256" width="256" height="256" class="m-1.5"/>

        Name: {{ profile.name }} <br>
        E-Mail: {{ profile.email }}<br>        
    </main>    
</template>