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
  getLikes(predicate: 'liked' | 'likedBy' | 'mutual' = 'liked'): Observable<Member[]> {
    const params = new HttpParams().set('predicate', predicate);
    return this.http.get<Member[]>(this.baseUrl + 'likes', { params });
  }

  clearLikesIds(){
    this.likeIds.set([])
  }

  
}
