import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AudioBook, AudioBookTrack, Book } from 'src/app/models/bookModels';

@Component({
  selector: 'app-audio-book-player',
  templateUrl: './audio-book-player.component.html',
  styleUrls: ['./audio-book-player.component.scss'],
})
export class AudioBookPlayerComponent implements OnInit, AfterViewInit {
  @Input() open = false;
  @Input() track: AudioBookTrack;
  @Input() book: Book;
  public audioTimer: any;
  public audioProgress: number = 0;
  public progressTime: string;

  @Output() close = new EventEmitter<void>();

  @ViewChild('audioPlayer') playerRef: ElementRef<HTMLAudioElement>;

  get audio(): HTMLAudioElement {
    return this.playerRef.nativeElement;
  }


  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() { }

  public play() {
    this.audio.play();
    this.audioTimer = setInterval(() => {
      this.audioProgress = this.audio.currentTime;
      this.progressTime = this.convertHMS(this.audioProgress);
    }, 100);
  }

  public pause() {
    this.audio.pause();
    clearInterval(this.audioTimer);
  }

  public goForward(seconds: number) {
    this.audio.currentTime = this.audio.currentTime + seconds;
    this.audioProgress = this.audio.currentTime;
    this.progressTime = this.convertHMS(this.audioProgress);
  }

  public goBackward(seconds: number) {
    this.audio.currentTime = this.audio.currentTime - seconds;
    this.audioProgress = this.audio.currentTime;

  }

  public startSeek() {
    console.log('RIGHT HERE')
    clearInterval(this.audioTimer);
  }

  public seek(event: any) {
    this.audio.currentTime = event.detail.value;
    this.audioProgress = this.audio.currentTime;
    this.audioTimer = setInterval(() => {
      this.audioProgress = this.audio.currentTime;
      this.progressTime = this.convertHMS(this.audioProgress);
    }, 100);
  }

  public onWillDismiss() {
    this.close.emit();
  }

  public convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours: any = Math.floor(sec / 3600); // get hours
    let minutes: any = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds: any = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds; // Return is HH : MM : SS
  }
}
