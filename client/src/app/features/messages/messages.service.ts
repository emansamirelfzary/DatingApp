import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateMessage, Message } from './message';
import { PaginatedResult } from '../../shared/types/pagination';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getMessages(container: string = 'Inbox', pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResult<Message>> {
    let params = new HttpParams()
      .set('container', container)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<Message>>(this.baseUrl + 'messages', { params });
  }

  getInbox(pageNumber = 1, pageSize = 10): Observable<PaginatedResult<Message>> {
    return this.getMessages('Inbox', pageNumber, pageSize);
  }

  getMessageThread(recipientId: string): Observable<Message[]> {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + recipientId);
  }

  send(message: CreateMessage): Observable<Message> {
    return this.http.post<Message>(this.baseUrl + 'messages', message);
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'messages/' + id);
  }
}

