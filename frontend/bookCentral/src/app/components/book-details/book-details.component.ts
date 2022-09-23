import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Book } from 'src/app/models/bookModels';
import { Browser } from '@capacitor/browser';
import { BookService } from 'src/app/services/book.service';
import { StorageService } from 'src/app/services/storage.service';
import { take } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss'],
})
export class BookDetailsComponent implements OnInit {
@Input() open = false;
@Input() book: Book;
@Input() page = 'search';

@Output() close = new EventEmitter<void>();

  constructor(private bookService: BookService, private storageService: StorageService, private toastService: ToastService) { }

  ngOnInit() {}

  public onWillDismiss() {
    this.close.emit();
  }

  public addToWishList() {
    this.storageService.addToWishList(this.book);
  }

  public addToLibrary() {
    this.storageService.addToLibrary(this.book);
    this.close.emit();
    this.toastService.presentToast('Added To Library!', 'success');

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
