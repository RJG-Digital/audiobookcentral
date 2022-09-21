import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {
  public baseEndpoint = 'http://localhost:5500/api/'
  constructor() { }

  public getBookEndpoint(): string {
    return `${this.baseEndpoint}books/`;
  }
}
