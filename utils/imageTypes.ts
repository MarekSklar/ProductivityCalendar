declare global {
    interface Image {
        uuid: string,
        img: string
    }
    
    interface AllPfps {
        [uuid: string]: string;
    }
}