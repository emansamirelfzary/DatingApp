import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap, timer } from 'rxjs';
import { AccountService } from '../../../core/services/account-service';
import { MessagesService } from '../../../features/messages/messages.service';
import { Message } from '../../../features/messages/message';
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
private readonly messagesService = inject(MessagesService);
private readonly destroyRef = inject(DestroyRef);

protected currentUser = this.accountService.currentUser;
protected isAdmin = this.accountService.isAdmin;
private readonly currentUser$ = toObservable(this.currentUser);
 protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
protected themes = Themes;
protected readonly unreadMessageCount = signal(0);
protected readonly unreadMessages = signal<Message[]>([]);
/*
ngOnInit() {
    this.accountService.setCurrentUser();
  }
*/
ngOnInit() {
  document.documentElement.setAttribute('data-theme', this.selectedTheme());
  combineLatest([this.currentUser$, timer(0, 30_000)])
    .pipe(
      switchMap(([user]) => user
        ? this.messagesService.getUnreadNotifications()
        : of({ count: 0, messages: [] as Message[] })),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: ({ count, messages }) => {
        this.unreadMessageCount.set(count);
        this.unreadMessages.set(messages);
      },
    });

  }

openMessageFromNotification(senderId: string, dropdown: HTMLDetailsElement): void {
  dropdown.open = false;
  const clearedCount = this.unreadMessages().filter((message) => message.senderId === senderId).length;
  this.unreadMessages.update((messages) => messages.filter((message) => message.senderId !== senderId));
  this.unreadMessageCount.update((count) => Math.max(0, count - clearedCount));
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
