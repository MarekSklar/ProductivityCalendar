declare global {

    interface Profile {
        uuid: string,
        name: string,
        email: string
        password: string,
        role: string,
        pfpPath256: string,
        pfpPath48: string,
        sessionToken: string
    }

    interface ProfileAddOptions {
        name: string,
        email: string,
        password: string,
        role: string,
        pfpPath256: string,
        pfpPath48: string,
        sessionToken: string
    }

    interface ProfileLoginOptions {
        email: string,
        password: string
    }

    interface ProfileGetOptions {
        sessionToken: string
    }

    interface ProfileEditOptions {
        uuid: string,
        name: string,
        email: string
        password?: string | null,
        role: string,
        pfpPath256: string,
        pfpPath48: string,
        sessionToken?: string | null
    }

    interface ProfileGetByUUIDOptions {
        uuid: string
    }

}