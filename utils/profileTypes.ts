interface Profile {
    uuid: string,
    name: string,
    email: string
    password: string,
    pfpPath256: string,
    pfpPath48: string,
    sessionToken: string
}

interface ProfileAddOptions {
    name: string,
    email: string,
    password: string,
    pfpPath256: string,
    pfpPath48: string,
    pfpPath256Cwd:string,
    pfpPath48Cwd:string,
    sessionToken: string
}

interface ProfileLoginOptions {
    email: string,
    password: string
}

interface ProfileGetOptions {
    sessionToken: string
}