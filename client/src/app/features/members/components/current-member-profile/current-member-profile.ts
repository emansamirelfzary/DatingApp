import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { AccountService } from '../../../../core/services/account-service';
import { Member } from '../../interfaces/member.interface';
import { MembersService } from '../../services/members';
import { MemberProfileDetails } from '../member-profile-details/member-profile-details';

@Component({
  selector: 'app-current-member-profile',
  imports: [RouterLink, MemberProfileDetails],
  templateUrl: './current-member-profile.html',
})
export class CurrentMemberProfile implements OnInit {
  private accountService = inject(AccountService);
  private membersService = inject(MembersService);
  private destroyRef = inject(DestroyRef);

  member = signal<Member | null>(null);
  isLoading = signal(true);
  loadError = signal(false);

  ngOnInit(): void {
    const memberId = this.accountService.currentUser()?.id;
    const memberRequest: Observable<Member | null> = memberId
      ? this.membersService.getMember(memberId)
      : of(null);

    memberRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: member => {
          this.member.set(member);
          this.isLoading.set(false);
          this.loadError.set(!member);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set(true);
        },
      });
  }

  updateMainPhoto(photoUrl: string): void {
    this.member.update(member => member ? { ...member, photoUrl } : member);
  }
}
