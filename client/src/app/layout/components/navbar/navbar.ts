import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../../core/services/account-service';
import { Themes } from '../../themes/themes';

@Component({
  selector: 'app-navbar',
 imports: [RouterLink, RouterLinkActive],
 templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar  implements OnInit {
private accountService= inject(AccountService);
private router=inject(Router);

protected currentUser = this.accountService.currentUser;
protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
protected themes = Themes;
/*
ngOnInit() {
    this.accountService.setCurrentUser();
  }
*/
ngOnInit() {

      document.documentElement.setAttribute('data-theme', this.selectedTheme());

  }

handleSelectTheme(theme: string, dropdown: HTMLDetailsElement) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    dropdown.open = false;
  }

logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/home');

  }

}
