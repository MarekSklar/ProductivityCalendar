declare global {

    interface Section {
        uuid: string,
        name: string,
        sectionIndex: number
    }

    interface SectionAddOptions {
        name: string,
        sectionIndex: number
    }

    interface SectionEditOptions {
        uuid: string,
        name: string,
        sectionIndex: number
    }

    interface SectionDeleteOptions {
        uuid: string
    }

}