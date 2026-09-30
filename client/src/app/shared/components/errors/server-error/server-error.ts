import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  templateUrl: './server-error.html',
  styleUrl: './server-error.css',
})
export class ServerError {
  protected 
  private router=inject(Router)

  constructor() {
    const navigation = this.router.getCurrentNavigation()
  }

  reloadPage() {
    window.location.reload();
  }
}
