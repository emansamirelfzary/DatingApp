// member.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, Photo, UpdateMember } from '../interfaces/member.interface';
import { environment } from '../../../../environments/environment.development';
import { PaginatedResult } from '../../../shared/types/pagination';



@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // GET: http://localhost:5001/api/members
  getMembers(pageNumber = 1, pageSize = 5): Observable<PaginatedResult<Member>> {
    let params = new HttpParams();
    params = params.set('pageNumber', pageNumber.toString());
    params = params.set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResult<Member>>(this.baseUrl + 'members', { params });
  }

  // GET: http://localhost:5001/api/members/1
  getMember(id: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + 'members/' + id);
  }

  getMemberPhotos(id: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.baseUrl + 'members/' + id + '/photos');
  }

  uploadPhoto(file: File): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<Photo>(this.baseUrl + 'members/add-photo', formData);
  }

  updateMember(id: string, member: UpdateMember): Observable<Member> {
    return this.http.put<Member>(this.baseUrl + 'members/' + id, member);
  }

  setMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(this.baseUrl + 'members/set-main-photo/' + photoId, {});
  }
  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'members/delete-photo/' + photoId);
  }
}
