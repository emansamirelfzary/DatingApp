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
  @Input() canUpload = false;

  protected photos = signal<Photo[]>([]);
  protected isLoading = signal(false);
  protected isUploading = signal(false);
  protected uploadError = signal<string | null>(null);

  protected membersService = inject(MembersService);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['memberId']) {
      return;
    }

    this.loadPhotos();
  }

  protected loadPhotos(): void {
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

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isUploading.set(true);
    this.uploadError.set(null);

    this.membersService.uploadPhoto(file).subscribe({
      next: (photo) => {
        this.photos.update((current) => [photo, ...current]);
        this.isUploading.set(false);
        input.value = '';
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadError.set(err?.error?.message ?? 'Unable to upload photo.');
        input.value = '';
      },
    });
  }
}
