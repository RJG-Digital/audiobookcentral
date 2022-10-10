import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AudioBook, Book } from 'src/app/models/bookModels';
import { StorageService } from 'src/app/services/storage.service';
import { take, takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { SocketService } from 'src/app/services/socket.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss'],
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Input() audioBookOptions: AudioBook[];
  @Input() audioBookFindDone = false;
  @Input() book: Book;
  @Input() page = 'search';
  @Output() close = new EventEmitter<void>();

  public selectedAudioBook: AudioBook;
  public downloading = false;
  public downloadProgress = 0;
  public downloadProgressPercentage = '0%'
  public downloadTrack = 0;
  public downloadStarting = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private storageService: StorageService,
    private toastService: ToastService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.socketService.listen('downloading')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((ab: any) => {
        if (ab) {
          this.downloadStarting = false
          this.downloading = true;
          this.downloadProgress = ab.progress;
          this.downloadProgressPercentage = Math.floor(this.downloadProgress * 100).toString();
          this.downloadTrack = ab.track
        }
      });
    this.socketService.listen('downloaded')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((ab: any) => {
        if (ab) {
          this.book.audioBook = ab;
          this.storageService.addToLibrary(this.book);
          this.close.emit();
          this.toastService.presentToast('Added To Library!', 'success');
        }
        this.downloading = false;
      });

  }

  public onWillDismiss() {
    this.close.emit();
  }

  public addToWishList() {
    this.storageService.addToWishList(this.book);
  }

  public addToLibrary(audioBook: AudioBook) {
    if (audioBook._id) {
      this.book.audioBook = audioBook;
      this.storageService.addToLibrary(this.book);
      this.close.emit();
      this.toastService.presentToast('Added To Library!', 'success');
    } else {
      this.downloadStarting = true;
      this.socketService.emit('download', audioBook);
    }
  }

  public onFileSelected(event) {
    console.log(event);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
