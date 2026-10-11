import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Member } from '../../interfaces/member.interface';
import { Likes } from '../../services/likes';
import { MemberCard } from '../member-card/member-card';

@Component({
  selector: 'app-liked-members',
  standalone: true,
  imports: [MemberCard, RouterLink],
  templateUrl: './liked-members.html',
})
export class LikedMembers implements OnInit {
  private readonly likesService = inject(Likes);

  protected readonly members = signal<Member[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLikedMembers();
  }

  protected removeIfUnliked(event: { memberId: string; isLiked: boolean }): void {
    if (!event.isLiked) {
      this.members.update((members) =>
        members.filter((member) => member.id !== event.memberId),
      );
    }
  }

  protected loadLikedMembers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.likesService.getLikes('liked').subscribe({
      next: (members) => {
        this.members.set(members);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading liked members:', error);
        this.errorMessage.set('Could not load your liked members. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
