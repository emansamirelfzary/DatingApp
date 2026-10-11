import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../interfaces/member.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Likes {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  likeIds = signal<string[]>([]);

  toggleLike(targetMemberId: string): Observable<void> {
    return this.http.post<void>(this.baseUrl + 'likes/' + targetMemberId, {});
  }

  getLikeIds(){
    return this.http.get<string[]>(this.baseUrl + 'likes/list').subscribe({
      next: ids=> this.likeIds.set(ids)
    });
  }

  // GET: api/likes?predicate=liked
  getLikes(predicate: string): Observable<Member[]> {
    

    return this.http.get<Member[]>(this.baseUrl + 'likes?predicate=' + predicate);
  }

  clearLikesIds(){
    this.likeIds.set([])
  }

  
}
