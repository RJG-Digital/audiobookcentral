import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AudioBook, Book } from 'src/app/models/bookModels';
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
  @Input() audioBookOptions: AudioBook[];
  @Input() audioBookFindDone = false;
  @Input() book: Book;
  @Input() page = 'search';
  @Output() close = new EventEmitter<void>();

  public selectedAudioBook: AudioBook;

  constructor(private bookService: BookService, private storageService: StorageService, private toastService: ToastService) { }

  ngOnInit() {
    console.log(this.audioBookOptions);
  }

  public onWillDismiss() {
    this.close.emit();
  }

  public addToWishList() {
    this.storageService.addToWishList(this.book);
  }

  public addToLibrary(audioBook: AudioBook) {
    console.log(audioBook);
    if (audioBook._id) {
      this.book.audioBook = audioBook;
      this.storageService.addToLibrary(this.book);
      this.close.emit();
      this.toastService.presentToast('Added To Library!', 'success');
    } else {
      this.bookService.downloadBook(audioBook)
        .pipe(take(1))
        .subscribe(ab => {
          if (ab) {
            console.log(ab);
            this.book.audioBook = ab;
            this.storageService.addToLibrary(this.book);
            this.close.emit();
            this.toastService.presentToast('Added To Library!', 'success');
          }
        });
    }
  }
}
