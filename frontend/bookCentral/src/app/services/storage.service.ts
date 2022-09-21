import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as Cordovasqlitedriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../models/bookModels';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public storageReady$ = new BehaviorSubject<boolean>(false);
  public library$ = new BehaviorSubject<Book[]>([]);
  public wishList$ = new BehaviorSubject<Book[]>([]);

  constructor(private storage: Storage) { }

  public async init() {
    await this.storage.defineDriver(Cordovasqlitedriver);
    await this.storage.create();
    this.storageReady$.next(true);
  }

  public async loadLibrary(): Promise<void> {
    const books = await this.storage.get('library') || [];
    this.library$.next(books);
  }

  public async loadWishList(): Promise<void> {
    const books = await this.storage.get('wishList') || [];
    this.wishList$.next(books);
  }

  public async getLibrary(): Promise<Book[]> {
    const books = await this.storage.get('library') || [];
    return books;
  }

  public async addToLibrary(book: Book): Promise<void> {
    const storedBooks = await this.getLibrary();
    storedBooks.push(book);
    await this.storage.set('library', storedBooks);
    this.library$.next(storedBooks);
  }

  public async removeFromLibrary(value: string): Promise<void> {
    const storedBooks = await this.getLibrary();
    const newBooks = storedBooks.filter(book => book.title !== value);
    await this.storage.set('library', newBooks);
    this.library$.next(newBooks);
  }

  public async getWishList(): Promise<Book[]> {
    const books = await this.storage.get('wishList') || [];
    return books;
  }

  public async addToWishList(book: Book): Promise<void> {
    const storedBooks = await this.getWishList();
    storedBooks.push(book);
    await this.storage.set('wishList', storedBooks);
    this.wishList$.next(storedBooks);
  }

  public async removeFromWishList(value: string): Promise<void> {
    const storedBooks = await this.getWishList();
    const newBooks = storedBooks.filter(book => book.title !== value);
    await this.storage.set('wishList', newBooks);
    this.wishList$.next(newBooks);
  }
}
