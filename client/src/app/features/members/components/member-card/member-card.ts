import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Member } from '../../interfaces/member.interface';
import { Likes } from '../../services/likes';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './member-card.html',
})
export class MemberCard {
  readonly member = input.required<Member>();
  readonly likeChanged = output<{ memberId: string; isLiked: boolean }>();

  private readonly likesService = inject(Likes);
  protected readonly isLiked = computed(() =>
    this.likesService.likeIds().includes(this.member().id),
  );
  protected readonly isTogglingLike = signal(false);

  toggleLike(): void {
    if (this.isTogglingLike()) {
      return;
    }

    this.isTogglingLike.set(true);
    this.likesService
      .toggleLike(this.member().id)
      .pipe(finalize(() => this.isTogglingLike.set(false)))
      .subscribe({
        next: () => {
          const memberId = this.member().id;
          const wasLiked = this.likesService.likeIds().includes(memberId);
          this.likesService.likeIds.update((ids) =>
            wasLiked ? ids.filter((id) => id !== memberId) : [...ids, memberId],
          );
          this.likeChanged.emit({ memberId, isLiked: !wasLiked });
        },
        error: (err) => {
          console.error('Error toggling member like:', err);
        },
      });
  }
}
