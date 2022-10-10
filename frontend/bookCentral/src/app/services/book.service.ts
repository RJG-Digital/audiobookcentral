import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioBook, Book, BookSearchPayload } from '../models/bookModels';
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

  public searchBooks(payload: BookSearchPayload): Observable<Book[]> {
    return this.http.post<Book[]>(`${this.baseEndpoint}/search/`, payload);
  }

  public findAudioBook(bookTitle: string): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/${bookTitle}`);
  }

  public downloadBook(book: AudioBook): Observable<any> {
    return this.http.post<any>(`${this.baseEndpoint}/download`, { book });
  }

  public uploadAudioBook(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseEndpoint}/upload`, formData);
  }
}
