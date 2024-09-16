/**
 - requires: sessionToken as string
 - returns: Profile with that sessionToken in Proxy(object)
*/
export async function fetchProfile(sessionToken: string) {
    const { data: profileData } = await useFetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken }});
    const profile = profileData.value?.at(0);
    console.log(profile);    
    return profile;
}

export async function fetchAllProfiles() {
    const { data: profiles } = await useFetch('/api/profiles/profilesList', { method: 'post' })
    
    return profiles.value;
}

/**
 - requires: profile
 - returns: object with data and format of image
*/
export async function fetchProfileImage(path: any) {
    
    const pfp = await $fetch('/api/getImage', { method: 'post', body: { path }});
    const pfpFormat: string = path.split('.').pop();

    return {data: pfp as string, format: pfpFormat};
}

export async function fetchAllProfileImages() {
    const { data: pfps } = await useFetch('/api/getAllImages', { method: 'post' });
    
    return pfps.value;
}

export async function fetchLogin(email: string, password: string) {
    const login = await $fetch(`/api/profiles/login`, {
        method: 'post',
        body: {
            email: email,
            password: password
        }
    });

    return login;
}

export async function fetchRegister(name: string, email: string, password: string, pfpPath256: string, pfpPath48: string) {
    const profile = await $fetch('/api/profiles/profilesCreate', {
        method: 'post',
        body: {
            name,
            email,
            password,
            pfpPath256,
            pfpPath48,
            sessionToken: "null",
        }
    });

    return profile;
}

export async function fetchUploadProfileImages(files: any) {
    const fd = new FormData();
    Array.from(files).map((file, index) => {
        fd.append(String(index), file as string);
    });

    const upload = await $fetch('/api/upload', {
        method: 'post',
        body: fd,
    });

    return upload;
}
