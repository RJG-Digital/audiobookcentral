import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookDetailsComponent } from './book-details/book-details.component';
import { IonicModule } from '@ionic/angular';
import { AudioBookPlayerComponent } from './audio-book-player/audio-book-player.component';

@NgModule({
  declarations: [BookDetailsComponent, AudioBookPlayerComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [BookDetailsComponent, AudioBookPlayerComponent]
})
export class ComponentsModule { }
