import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Book } from 'src/app/models/bookModels';
import { Browser } from '@capacitor/browser';
import { BookService } from 'src/app/services/book.service';
import { StorageService } from 'src/app/services/storage.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss'],
})
export class BookDetailsComponent implements OnInit {
@Input() open = false;
@Input() book: Book;

@Output() close = new EventEmitter<void>();

  constructor(private bookService: BookService, private storageService: StorageService) { }

  ngOnInit() {}

  public onWillDismiss() {
    this.close.emit();
  }

  public async openSite (url: string) {
      await Browser.open({ url });
    };

  public addToWishList() {
    this.storageService.addToWishList(this.book);
  }

  public addToLibrary() {
    this.storageService.addToLibrary(this.book);
  }

  public searchAudioBook() {
    this.bookService.findAudioBook(this.book.author + ' ' + this.book.title)
    .pipe(take(1))
    .subscribe(book => {
      if(book) {
        
      }
    });
  }
}
