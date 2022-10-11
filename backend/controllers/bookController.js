import asynchandler from 'express-async-handler';
import dotenv from 'dotenv';
import colors from 'colors';
import {
    GOOGLE_BOOKS_BY_ISBN,
    GOOLGE_BOOKS_BY_TITLE,
    GOOGLE_BOOKS_BY_AUTHOR,
} from '../config/constants.js';
import Book from '../models/book.js';
import axios from 'axios'

const searchBooks = asynchandler(async (req, res) => {
    const { searchType, searchText } = req.body;
    let result = [];
    switch (searchType) {
        case 'isbn': result = await (await axios.get(`${GOOGLE_BOOKS_BY_ISBN}${searchText}&maxResults=40&printType=books`)).data; break;
        case 'title': result = await (await axios.get(`${GOOLGE_BOOKS_BY_TITLE}${searchText}&maxResults=40&printType=books`)).data; break;
        case 'author': result = await (await axios.get(`${GOOGLE_BOOKS_BY_AUTHOR}${searchText}&maxResults=40&printType=books`)).data; break;
        default: break;
    }
    let books = [];
    if (result.items) {
        books = result.items.map(book => {
            return {
                title: book.volumeInfo?.title,
                author: book.volumeInfo?.authors?.length > 0 ? book.volumeInfo?.authors[0] : '',
                image: book.volumeInfo?.imageLinks?.thumbnail ? book.volumeInfo?.imageLinks?.thumbnail : '',
                description: book.volumeInfo?.description,
                googleId: book.id,
                publisher: book.volumeInfo?.publisher,
                publishedDate: new Date(book.volumeInfo?.publishedDate),
                isbn_13: book.volumeInfo?.industryIdentifiers?.length > 0 ? book.volumeInfo?.industryIdentifiers[0].identifier : '',
                isbn_10: book.volumeInfo?.industryIdentifiers?.length > 1 ? book.volumeInfo?.industryIdentifiers[1].identifier : '',
                pageCount: book.volumeInfo?.pageCount,
                categories: book.volumeInfo?.categories,
                language: book.volumeInfo?.language,
                previewLink: book.volumeInfo?.previewLink,
                infoLink: book.volumeInfo?.infoLink
            }
        });
        books = books.filter(book => book.image !== '' && book.isbn_13);
    }
    res.json(books);
});

const uploadBook = asynchandler(async (req, res) => {
    const {numberOfTacks, bookTitle, bookAuthor } = req.body;
    console.log(numberOfTacks)
    const filesToSave = [];
    const paths = [];
    for(let i = 0; i < parseInt(numberOfTacks); i++) {
        const file = req.files[`track${i+1}`];
        console.log(file);
        const path = `C:/audioBooks/onlineBooks/${bookAuthor}/${bookTitle}/${file.name}`;
        console.log(path);
        paths.push(path);
        filesToSave.push(file.mv(path));

    }
    await Promise.all(filesToSave);
    res.json(paths)
});

export { searchBooks, uploadBook };
