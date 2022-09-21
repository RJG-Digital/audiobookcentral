import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Book } from '../models/bookModels';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy{

  public library: Book[] = [];
  public unsubscribe = new Subject<void>();

  constructor(private storageService: StorageService) {}

   ngOnInit(): void {
    this.getLibrary();   
  }

  private getLibrary() {
    this.storageService.library$
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(lib => {
     this.library = lib;
    });
  }

  public deleteBook(book: Book): void {
    this.storageService.removeFromLibrary(book.title);
    this.getLibrary();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
