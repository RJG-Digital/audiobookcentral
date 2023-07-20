import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  public downloadBook(book: Book){
    return this.http.get(`${this.baseEndpoint}/download/${book.author}/${book.title}`, {
      responseType: 'blob'
    });
  }

  public uploadAudioBook(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseEndpoint}/upload`, formData);
  }

  public saveUploadedFiles(book: Book): Observable<any> {
    return this.http.post(`${this.baseEndpoint}/saveUpload`, { book });
  }
}
