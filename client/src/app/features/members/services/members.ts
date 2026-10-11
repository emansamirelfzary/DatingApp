// member.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, MemberFilters, Photo, UpdateMember } from '../interfaces/member.interface';
import { environment } from '../../../../environments/environment.development';
import { PaginatedResult } from '../../../shared/types/pagination';



@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // GET: http://localhost:5001/api/members
  getMembers(
    pageNumber = 1,
    pageSize = 5,
    filters: MemberFilters = {},
  ): Observable<PaginatedResult<Member>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filters.gender) {
      params = params.set('gender', filters.gender);
    }
    if (filters.minAge != null) {
      params = params.set('minAge', filters.minAge.toString());
    }
    if (filters.maxAge != null) {
      params = params.set('maxAge', filters.maxAge.toString());
    }
    if (filters.orderBy) {
      params = params.set('orderBy', filters.orderBy);
    }

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
