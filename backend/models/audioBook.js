import mongoose from 'mongoose';

const track = mongoose.Schema({
    path: {
        type: String
    },
    trackNumber: {
        type: Number
    }
})

const audioBookSchema = mongoose.Schema({
    authorTitle: {
        type: String
    },
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
    genres: {
        type: [String],
        default: []
    },
    tracks: {
        type: [track]
    }
})
const AudioBook = mongoose.model('audioBook', audioBookSchema);
export default AudioBook;