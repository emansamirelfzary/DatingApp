import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { MembersService } from '../../services/members';
import { Photo } from '../../interfaces/member.interface';

@Component({
  selector: 'app-member-photo-list',
  templateUrl: './member-photo-list.html',
})
export class MemberPhotoList implements OnChanges {
  @Input({ required: true }) memberId = '';
  @Input() previewLimit: number | null = null;

  protected photos = signal<Photo[]>([]);
  protected isLoading = signal(false);

  private membersService = inject(MembersService);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['memberId']) {
      return;
    }

    if (!this.memberId) {
      this.photos.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.membersService.getMemberPhotos(this.memberId).subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error fetching member photos:', err);
      },
    });
  }
}
