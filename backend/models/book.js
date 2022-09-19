import mongoose from 'mongoose';

const bookSchema = mongoose.Schema({
    title: {
        type: String
    },
    author: {
        type: String
    },
    image: {
        type: String
    },
    description: {
        type: String,
        default: null
    },
    googleId: {
        type: String
    },
    genres: {
        type: [String],
        default: []
    },
    publisher: {
        type: String
    },
    publishedDate: {
        type: Date
    },
    isbn_13: {
        type: String
    },
    isbn_10: {
        type: String
    },
    pageCount: {
        type: Number
    },
    categories: {
        type: [String]
    },
    language: {
        type: String
    },
    previewLink: {
        type: String
    },
    infoLink: {
        type: String
    },
    audioBook: {
        type: mongoose.Types.ObjectId,
        ref: 'audioBook',
        default: null
    }
})
const Book = mongoose.model('book', bookSchema);
export default Book;