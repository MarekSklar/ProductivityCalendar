export interface Profile {
    uuid: string,
    name: string,
    email: string
    password: string,
    pfpPath256: string,
    pfpPath48: string,
    sessionToken: string
}

export interface ProfileAddOptions {
    name: string,
    email: string,
    password: string,
    pfpPath256: string,
    pfpPath48: string,
    sessionToken: string
}

export interface ProfileLoginOptions {
    email: string,
    password: string
}

export interface ProfileGetOptions {
    sessionToken: string
}

export interface ProfileGetByUUIDOptions {
    uuid: string
}
