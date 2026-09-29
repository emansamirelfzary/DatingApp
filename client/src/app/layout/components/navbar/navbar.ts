import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-navbar',
 imports: [RouterLink, RouterLinkActive],
 templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar  {
private accountService= inject(AccountService);

protected currentUser = this.accountService.currentUser;
/*
ngOnInit() {
    this.accountService.setCurrentUser();
  }
*/
logout() {
    this.accountService.logout();
  }

}
