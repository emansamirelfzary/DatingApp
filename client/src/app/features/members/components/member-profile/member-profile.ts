import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembersService } from '../../services/members';
import { Member } from '../../interfaces/member.interface';
import { AccountService } from '../../../../core/services/account-service';
import { finalize, of, switchMap } from 'rxjs';
import { Likes } from '../../services/likes';
import { MemberProfileDetails } from '../member-profile-details/member-profile-details';

@Component({
  selector: 'app-member-profile',
  imports: [RouterLink, MemberProfileDetails],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private membersService = inject(MembersService);
  private accountService = inject(AccountService);
  private likesService = inject(Likes);

  member = signal<Member | null>(null);
  currentUser = this.accountService.currentUser;
  isLiked = computed(() => {
    const memberId = this.member()?.id;
    return memberId ? this.likesService.likeIds().includes(memberId) : false;
  });
  isTogglingLike = signal(false);


  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.member.set(null);

        const id = params.get('id');
        return id ? this.membersService.getMember(id) : of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (data) => {
        if (data?.id === this.currentUser()?.id) {
          void this.router.navigate(['/profile'], { replaceUrl: true });
          return;
        }
        this.member.set(data);
      },
      error: (err) => {
        console.error('Error fetching member profile:', err);
      },
    });

  }

  updateMainPhoto(photoUrl: string): void {
    this.member.update((member) => member ? { ...member, photoUrl } : member);
  }

  toggleLike(): void {
    const member = this.member();
    if (!member || member.id === this.currentUser()?.id || this.isTogglingLike()) {
      return;
    }

    this.isTogglingLike.set(true);
    this.likesService
      .toggleLike(member.id)
      .pipe(finalize(() => this.isTogglingLike.set(false)))
      .subscribe({
        next: () => {
          const wasLiked = this.isLiked();
          this.likesService.likeIds.update((ids) =>
            wasLiked
              ? ids.filter((id) => id !== member.id)
              : [...ids, member.id],
          );
        },
        error: (err) => {
          console.error('Error toggling member like:', err);
        },
      });
  }

}
