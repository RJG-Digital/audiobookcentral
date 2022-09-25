import { Component, OnInit } from '@angular/core';
import { AudioBook, Book, BookSearchPayload } from '../models/bookModels';
import { BookService } from '../services/book.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { StorageService } from 'src/app/services/storage.service';
import { Browser } from '@capacitor/browser';
import { take } from 'rxjs/operators'
import { ToastService } from '../services/toast.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  public books: Book[] = [];
  public searchType: 'title' | 'author' | 'isbn' = 'title';
  public searchText = '';
  public openModal = false;
  public selectedBook: Book;
  public showSearch = true;
  public showScan = false;
  public audioBookFindDone = true;
  public library: Book[] = [];
  public unsubscribe$ = new Subject<void>();
  public audioBookOptions: AudioBook[] = [];

  constructor(
    public bookService: BookService,
    private barcodeScanner: BarcodeScanner,
    private storageService: StorageService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {

  }

  public search(): void {
    if (this.searchText && this.searchText.trim() !== '') {
      const payload: BookSearchPayload = {
        searchText: this.searchText,
        searchType: this.searchType
      }
      this.bookService.searchBooks(payload)
        .pipe(take(1))
        .subscribe((books: Book[]) => {
          if (books) {
            this.books = books;
            console.log(books);
          }
        })
    }
  }

  public viewBookDetails(book: Book): void {
    this.selectedBook = book;
  }

  public onShowSearch() {
    this.showScan = false;
    this.showSearch = true;
  }

  public onScan() {
    this.barcodeScanner
      .scan()
      .then((barcodeData) => {
        if (barcodeData) {
          this.searchText = barcodeData.text;
          this.searchType = 'isbn';
          this.search();
        }
      })
  }

  public async openSite(url: string) {
    await Browser.open({ url });
  };

  public addToWishList() {
    this.storageService.addToWishList(this.selectedBook);
  }

  public addToLibrary() {
    this.storageService.addToLibrary(this.selectedBook);
    this.toastService.presentToast('Added to library!', 'success');
  }

  public searchAudioBook() {
    this.audioBookFindDone = false;
    this.openModal = true;
    this.bookService.findAudioBook(this.selectedBook.author + ' ' + this.selectedBook.title)
      .pipe(take(1))
      .subscribe(audioBooks=> {
        if (audioBooks) {
          this.audioBookOptions = audioBooks;
          console.log(audioBooks);
          this.audioBookFindDone = true;
        }
      });
  }
}
