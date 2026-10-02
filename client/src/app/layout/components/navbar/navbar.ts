import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-navbar',
 imports: [RouterLink, RouterLinkActive],
 templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar  {
private accountService= inject(AccountService);
private router=inject(Router);

protected currentUser = this.accountService.currentUser;
/*
ngOnInit() {
    this.accountService.setCurrentUser();
  }
*/
logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/home');
    
  }

}
