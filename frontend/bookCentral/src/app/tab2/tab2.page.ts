import { Component, OnDestroy, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { AlertController, IonMenu } from '@ionic/angular';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AccordianData, AudioBookTrack, Book } from '../models/bookModels';
import { BookService } from '../services/book.service';
import { LodashService } from '../services/lodash.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';


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
  public authorAccordianData: AccordianData[] = [];
  public alphabetAccordianData: AccordianData[] = [];
  public showAlphaView = false;
  public showFullListView = true;
  public showAuthorView = false;
  public allFilter = true;
  public audioFilter = false;
  public noAudioFilter = false;

  constructor(
    private storageService: StorageService,
    private bookService: BookService,
    private alertController: AlertController,
    private toastService: ToastService,
    private lodashService: LodashService
  ) { }

  ngOnInit(): void {
    this.getLibrary();
  }

  private getLibrary() {
    this.storageService.library$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(lib => {
        this.library = lib;
        this.library.sort((a: Book, b: Book) => (a.title > b.title) ? 1 : -1);
        this.authorAccordianData = this.lodashService.createAuthorArray(this.library);
        this.alphabetAccordianData = this.lodashService.createAlphabetArray(this.library);
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

  public onChangeView(view: 'fullList' | 'author' | 'alpha' = 'fullList') {
    switch(view) {
      case 'fullList': 
        this.showFullListView = true;
        this.showAlphaView = false;
        this.showAuthorView = false;
        break;
      case 'author':
        this.showFullListView = false;
        this.showAlphaView = false;
        this.showAuthorView = true;
        break;
      case 'alpha': 
        this.showFullListView = false;
        this.showAlphaView = true;
        this.showAuthorView = false;
        break;
      default:
        this.showFullListView = true;
        this.showAlphaView = false;
        this.showAuthorView = false;
        break;
    }
  }

  public filterData(filter: 'all'| 'audio' | 'noAudio') {
    this.getLibrary();
    switch(filter) {
      case 'all':
        this.allFilter = true;
        this.audioFilter = false;
        this.noAudioFilter = false;
        break;
      case 'audio': 
        this.filterAudio('a');
        this.allFilter = false;
        this.audioFilter = true;
        this.noAudioFilter = false;
        break;
      case 'noAudio': 
        this.filterAudio('na');
        this.allFilter = false;
        this.audioFilter = false;
        this.noAudioFilter = true;
        break;
    }
  }

  public filterAudio(type: 'a'|'na') {
    if(type === 'a') {
      this.library = this.library.filter(b => b.audioBook);
    } else if(type === 'na') {
      this.library = this.library.filter(b => !b.audioBook);
    }
    this.authorAccordianData = this.lodashService.createAuthorArray(this.library);
    this.alphabetAccordianData = this.lodashService.createAlphabetArray(this.library);
  }

  // Player
  public getCompletionPercentage() {
    const numOfTracksDone = this.selectedBook.audioBook.tracks.filter(track => track.finished).length;
    const numOfTracks = this.selectedBook.audioBook.tracks.length;
    return Math.floor((numOfTracksDone / numOfTracks) * 100);
  }

  public download(book: Book) {
    this.bookService.downloadBook(book)
    .pipe(take(1))
    .subscribe((data: any) => {
      const blob = new Blob([data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'files';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, (err) => {
      console.error(err);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
