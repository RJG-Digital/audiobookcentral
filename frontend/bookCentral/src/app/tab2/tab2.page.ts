import { Component, OnDestroy, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { AlertController, IonMenu } from '@ionic/angular';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AudioBookTrack, Book } from '../models/bookModels';
import { BookService } from '../services/book.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {

  public library: Book[] = [];
  public selectedBook: Book;
  public unsubscribe = new Subject<void>();
  public selectedTrack: AudioBookTrack;
  public openModal = false;


  constructor(
    private storageService: StorageService,
    private bookService: BookService,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.getLibrary();
  }

  private getLibrary() {
    this.storageService.library$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(lib => {
        this.library = lib;
        this.library.sort((a: Book, b: Book) => (a.title > b.title) ? 1 : -1)
      });
  }

  public deleteBook(menu: IonMenu, book: Book): void {
    this.storageService.removeFromLibrary(book.googleId);
    menu.close();
    this.getLibrary();
    this.toastService.presentToast('Deleted Successfully!', 'danger');
  }

  public searchAudioBook() {
    this.bookService.findAudioBook(this.selectedBook.author + ' ' + this.selectedBook.title)
      .pipe(take(1))
      .subscribe(book => {
        if (book) {

        }
      });
  }

  public selectBook(book: Book) {
    this.selectedBook = book;
    console.log('here');
  }

  public async openSite(url: string) {
    await Browser.open({ url });
  };

  public selectTrack(track: AudioBookTrack): void {
    this.selectedTrack = track;
    this.openModal = true;
  }

  async presentAlert(menu: IonMenu, book: Book) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure that you want to delete this book?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.deleteBook(menu, book);
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
  }

  // Player

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
