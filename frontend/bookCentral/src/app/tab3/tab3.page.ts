import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonMenu, IonModal } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccordianData, Book } from '../models/bookModels';
import { LodashService } from '../services/lodash.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {

  public wishList: Book[] = [];
  public selectedBook: Book;
  public authorAccordianData: AccordianData[] = [];
  public alphabetAccordianData: AccordianData[] = [];
  public showFullListView = true;
  
  private unsubscribe$ = new Subject<void>();

  @ViewChild(IonModal) modal: IonModal;


  constructor(
    private storageService: StorageService,
    private lodashService: LodashService,
    private alertController: AlertController,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getWishlist();
  }

  private getWishlist() {
    this.storageService.wishList$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(wl => {
      this.wishList = wl;
      this.alphabetAccordianData = this.lodashService.createAlphabetArray(this.wishList);
      this.authorAccordianData = this.lodashService.createAuthorArray(this.wishList);
      console.log(this.wishList);
    });
  }

  public async openSite(url: string) {
    await Browser.open({ url });
  };

  public async presentAlert(book: Book) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure that you want to delete this book?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.deleteBook(book);
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
  }

  public selectBook(book: Book) {
    this.selectedBook = book;
  }

  public onWillDismiss(event) {

  }

  public cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  public deleteBook( book: Book): void {
    this.storageService.removeFromWishList(book.googleId);
    this.cancel();
    this.getWishlist();
    this.toastService.presentToast('Deleted Successfully!', 'danger');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
