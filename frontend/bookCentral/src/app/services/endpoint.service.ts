import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {
  // public baseEndpoint = 'http://192.168.4.78:5500/api/';
  public baseEndpoint = 'http://192.168.4.103:5500/api/';
  constructor() { }

  public getBookEndpoint(): string {
    return `${this.baseEndpoint}books/`;
  }
}
