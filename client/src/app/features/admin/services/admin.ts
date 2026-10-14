import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { UserWithRoles } from '../interfaces/user-with-roles.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // GET: api/admin/users-with-roles
  getUsersWithRoles(): Observable<UserWithRoles[]> {
    return this.http.get<UserWithRoles[]>(
      this.baseUrl + 'admin/users-with-roles',
    );
  }

  // POST: api/admin/edit-roles/{userId}?roles=Admin,Moderator
  editRoles(userId: string, roles: string[]): Observable<string[]> {
    const params = new HttpParams().set('roles', roles.join(','));
    return this.http.post<string[]>(
      this.baseUrl + 'admin/edit-roles/' + userId,
      {},
      { params },
    );
  }
}
