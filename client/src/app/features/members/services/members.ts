// member.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, Photo, UpdateMember } from '../interfaces/member.interface';
import { environment } from '../../../../environments/environment.development';



@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // GET: http://localhost:5001/api/members
  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl + 'members');
  }

  // GET: http://localhost:5001/api/members/1
  getMember(id: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + 'members/' + id);
  }

  getMemberPhotos(id: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.baseUrl + 'members/' + id + '/photos');
  }

  updateMember(id: string, member: UpdateMember): Observable<Member> {
    return this.http.put<Member>(this.baseUrl + 'members/' + id, member);
  }
}
