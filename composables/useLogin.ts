export async function login(email: string, password: string, profiles: any): Promise<string> {
    if (profiles === null) return "";

    const login = await fetchLogin(email, password);

    if (login === undefined) return "Your E-Mail or password is incorrect.";
    else {
        editSessionToken(login);
        navigateTo('/');
    }

    return "";
};