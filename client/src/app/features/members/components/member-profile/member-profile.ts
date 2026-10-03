import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembersService } from '../../services/members';
import { Member, UpdateMember } from '../../interfaces/member.interface';
import { DatePipe } from '@angular/common';
import { MemberPhotoList } from '../member-photo-list/member-photo-list';
import { MemberEdit } from '../member-edit/member-edit';
import { AccountService } from '../../../../core/services/account-service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-member-profile',
  imports: [RouterLink, DatePipe, MemberPhotoList, MemberEdit],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private membersService = inject(MembersService);
  private accountService = inject(AccountService);

  member = signal<Member | null>(null);
  currentUser = this.accountService.currentUser;
  isEditing = signal(false);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.member.set(null);
        this.isEditing.set(false);
        this.saveError.set(null);

        const id = params.get('id');
        return id ? this.membersService.getMember(id) : of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (data) => {
        this.member.set(data);
        if (data) {
          this.openEditIfRequested(data);
        }
      },
      error: (err) => {
        console.error('Error fetching member profile:', err);
      },
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params.get('edit') === 'true') {
        const member = this.member();
        if (member) {
          this.openEditIfRequested(member);
        }
      } else {
        this.isEditing.set(false);
      }
    });
  }

  private openEditIfRequested(member: Member): void {
    if (
      this.route.snapshot.queryParamMap.get('edit') === 'true'
      && member.id === this.currentUser()?.id
      && !this.isEditing()
    ) {
      this.startEditing();
    }
  }

  startEditing(): void {
    this.saveError.set(null);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.saveError.set(null);
    this.isEditing.set(false);
    this.clearEditQueryParam();
  }

  saveProfile(profile: UpdateMember): void {
    const member = this.member();
    if (!member || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);
    this.membersService.updateMember(member.id, profile).subscribe({
      next: (updatedMember) => {
        this.member.set(updatedMember);
        const currentUser = this.accountService.currentUser();
        if (currentUser?.id === updatedMember.id) {
          const updatedUser = {
            ...currentUser,
            displayName: updatedMember.displayName,
          };
          this.accountService.currentUser.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.clearEditQueryParam();
      },
      error: (err) => {
        console.error('Error updating member profile:', err);
        this.saveError.set(
          typeof err.error === 'string'
            ? err.error
            : 'Could not save your profile. Please try again.',
        );
        this.isSaving.set(false);
      },
    });
  }

  private clearEditQueryParam(): void {
    if (this.route.snapshot.queryParamMap.has('edit')) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { edit: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }
}
