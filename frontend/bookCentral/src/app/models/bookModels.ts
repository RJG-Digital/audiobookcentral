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
    _id?: string;
    title: string;
    author: string;
    image: string;
    description: string;
    googleId: string;
    genres?: string[];
    publisher: string[];
    publishedDate: Date;
    isbn_13: string;
    isbn_10: string;
    pageCount: number;
    categories: string[];
    language: string;
    previewLink: string;
    infoLink: string;
    audioBookId?: string;
    audioBook?: AudioBook;
}

export interface BookSearchPayload {
    searchType: 'title' | 'author' | 'isbn';
    searchText: string
}