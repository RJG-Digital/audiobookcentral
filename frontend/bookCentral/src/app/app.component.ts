import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storageService: StorageService) {
    this.storageService.init();
    this.storageService.storageReady$
      .pipe(filter(ready => ready))
      .subscribe(() => {
        this.storageService.loadLibrary();
        this.storageService.loadWishList();
      })
  }
}
