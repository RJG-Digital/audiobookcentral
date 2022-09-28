import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client'
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: any;


  constructor(private endpointService: EndpointService) {
    this.socket = io.connect(this.endpointService.baseSocketEndpoint);
    console.log('connecting');
  }

  public listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    });
  }

  public emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
