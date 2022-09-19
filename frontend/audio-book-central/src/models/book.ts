export interface AudioBook {
    title: string;
    author: string;
    image: string;
    description: string
    genres: string[]
    tracks: AudioBookTrack[]
}

export interface AudioBookTrack {
    path: string
    trackNumber: number
}

export interface Book {

}