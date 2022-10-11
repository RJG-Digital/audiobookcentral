import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AudioBook, AudioBookTrack, Book } from 'src/app/models/bookModels';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-audio-book-player',
  templateUrl: './audio-book-player.component.html',
  styleUrls: ['./audio-book-player.component.scss'],
})
export class AudioBookPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
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


  constructor(private storageService: StorageService) { }
  ngOnDestroy(): void {
    this.playerRef.nativeElement = null;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  public play() {
    if (this.track && !this.track.started) {
      this.track.started = true;
    }
    if (this.track && this.track.started && this.track.lastStopTime) {
      this.audio.currentTime = this.track.lastStopTime;
    }
    if (!this.track.duration) {
      this.track.duration = this.audio.duration;
    }
    if (this.audioProgress > 0) {
      this.audio.currentTime = this.audioProgress;
    }
    this.audio.play();
    clearInterval(this.audioTimer);
    this.audioTimer = setInterval(() => {
      this.audioProgress = this.audio.currentTime;
      this.progressTime = this.convertHMS(this.audioProgress);
      if (this.audioProgress === this.audio.duration) {
        this.track.finished = true;
      }
    }, 100);
  }

  public pause() {
    clearInterval(this.audioTimer);
    this.audio.pause();
    this.track.lastStopTime = this.audioProgress;
    this.storageService.updateBookMark(this.book.googleId, this.track);

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
    clearInterval(this.audioTimer);
  }

  public seek(event: any) {
    clearInterval(this.audioTimer);
    this.audio.currentTime = event.detail.value;
    this.audioTimer = setInterval(() => {
      this.audioProgress = this.audio.currentTime;
      this.progressTime = this.convertHMS(this.audioProgress);
    }, 100);
  }

  public onWillDismiss() {
    this.track.lastStopTime = this.audioProgress;
    if (this.audioProgress === this.audio.duration) {
      this.track.finished = true;
    }
    // updateBook with track info
    this.storageService.updateBookMark(this.book.googleId, this.track);
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
