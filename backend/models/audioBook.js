import mongoose from 'mongoose';

const track = mongoose.Schema({
    path: {
        type: String
    },
    number: {
        type: Number
    },
    audioBookId: {
        type: mongoose.Types.ObjectId,
        ref: 'audioBook'
    }
})

const audioBookSchema = mongoose.Schema({
    title: {
        type: String
    },
    author: {
        type: String
    },
    description: {
        type: String
    },
    genres: {
        type: [String]
    },
    tracks: {
        type: [track]
    }
})
const AudioBook = mongoose.model('audioBook', audioBookSchema);
export default AudioBook;