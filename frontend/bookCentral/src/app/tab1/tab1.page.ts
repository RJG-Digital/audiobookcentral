import { Component } from '@angular/core';
import { Book, BookSearchPayload } from '../models/bookModels';
import { BookService } from '../services/book.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import {take} from 'rxjs/operators'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public books: Book[] = [];
  public searchType: 'title' | 'author' | 'isbn' = 'title';
  public searchText = '';
  public openModal = false;
  public selectedBook: Book;
  public showSearch = true;
  public showScan = false;

  constructor(public bookService: BookService,
    private barcodeScanner: BarcodeScanner,) {}

  public search(): void {
    if(this.searchText && this.searchText.trim() !== '') {
      const payload : BookSearchPayload = {
        searchText: this.searchText,
        searchType: this.searchType
      }
      this.bookService.searchBooks(payload)
      .pipe(take(1))
      .subscribe((books: Book[]) => {
        if(books) {
          this.books = books;
        }
      })
    }
  }

  public viewBookDetails(book: Book): void {
    this.selectedBook = book;
    this.openModal = true;
  }

  public onShowSearch() {
    this.showScan = false;
    this.showSearch = true;
  }

  public onScan() {
    this.barcodeScanner
    .scan()
    .then((barcodeData) => {
      if(barcodeData) {
        this.searchText = barcodeData.text;
        this.searchType = 'isbn';
        this.search();
      } 
    })
  }
}
