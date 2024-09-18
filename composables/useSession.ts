export function getSessionToken() {
    return useCookie<string>('sessionToken').value;
}

export async function checkSessionToken(uuid: string, sessionToken: string) {
    return await $fetch('/api/profiles/profileCheckSessionToken', { method: 'post', body: { uuid, sessionToken }});
}

export function navigateToInvalidSessionPage(sessionToken: string) {
    if (!sessionToken || sessionToken === null) navigateTo('/invalidSession');
}