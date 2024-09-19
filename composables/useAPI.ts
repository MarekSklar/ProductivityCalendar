/**
 - requires: sessionToken as string
 - returns: Profile with that sessionToken in Proxy(object)
*/
export async function fetchProfile(sessionToken: string) {
    const profileData = await $fetch('/api/profiles/profileGet', { method: 'post', body: { sessionToken: sessionToken }});
    const profile = profileData?.at(0);
    return profile;
}

export async function fetchAllProfiles() {
    const profiles = await $fetch('/api/profiles/profilesList', { method: 'post' })
    
    return profiles;
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
    const pfps = await $fetch('/api/getAllImages', { method: 'post' });
    
    return pfps;
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

export async function fetchRegister(name: string, email: string, password: string, role: string, pfpPath256: string, pfpPath48: string) {
    const profile = await $fetch('/api/profiles/profilesCreate', {
        method: 'post',
        body: {
            name,
            email,
            password,
            pfpPath256,
            pfpPath48,
            role,
            sessionToken: "null",
        }
    });

    return profile;
}

export async function fetchEditProfile(uuid: string ,name: string, email: string, password: string, role: string, pfpPath256: string, pfpPath48: string) {
    const profile = await $fetch('/api/profiles/profileEdit', {
        method: 'post',
        body: {
            uuid,
            name,
            email,
            password,
            pfpPath256,
            pfpPath48,
            role,
            sessionToken: "null",
        }
    });

    return profile;
}

export async function fetchDeleteProfile(uuid: string) {
    const profile = await $fetch('/api/profiles/profileDelete', {
        method: 'post',
        body: {
            uuid
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
