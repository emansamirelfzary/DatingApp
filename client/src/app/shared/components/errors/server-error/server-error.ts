import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../../types/error';


@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  templateUrl: './server-error.html',
  styleUrl: './server-error.css',
})
export class ServerError {
  protected error =signal<ApiError | null>(null)
  private router=inject(Router)

  constructor() {
    const navigation = this.router.getCurrentNavigation()
  }

  reloadPage() {
    window.location.reload();
  }
}
