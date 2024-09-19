export function getSessionToken() {
    return useCookie<string>('sessionToken').value;
}

export function editSessionToken(value: string) {
    const sessionToken = useCookie("sessionToken");
    sessionToken.value = value;
}

export function navigateToInvalidSessionPage(sessionToken: string) {
    if (!sessionToken || sessionToken === null || sessionToken === "null") navigateTo('/invalidSession');
}