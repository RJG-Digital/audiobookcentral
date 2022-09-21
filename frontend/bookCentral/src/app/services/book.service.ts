import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book, BookSearchPayload } from '../models/bookModels';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private baseEndpoint = '';
  
  constructor(
    private endpointService: EndpointService, 
    private http: HttpClient,
    ) { 
    this.baseEndpoint = this.endpointService.getBookEndpoint();
  }

  public searchBooks(payload: BookSearchPayload): Observable<Book[]>{
    return this.http.post<Book[]>(`${this.baseEndpoint}/search/`, payload);
  }

  public findAudioBook(bookTitle: string): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/${bookTitle}`);
  }
}
