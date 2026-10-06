import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { MembersService } from '../../services/members';
import { Photo } from '../../interfaces/member.interface';
import { AccountService } from '../../../../core/services/account-service';
@Component({
  selector: 'app-member-photo-list',
  templateUrl: './member-photo-list.html',
})
export class MemberPhotoList implements OnChanges {
  @Input({ required: true }) memberId = '';
  @Input() previewLimit: number | null = null;
  @Input() canUpload = false;
  @Output() mainPhotoChanged = new EventEmitter<string>();

  protected photos = signal<Photo[]>([]);
  protected isLoading = signal(false);
  protected isUploading = signal(false);
  protected settingMainPhotoId = signal<number | null>(null);
  protected uploadError = signal<string | null>(null);
  protected setMainPhotoError = signal<string | null>(null);

  protected membersService = inject(MembersService);
  protected accountService = inject(AccountService);

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
        if (photo.isMain) {
          this.updateCurrentUserPhoto(photo);
          this.mainPhotoChanged.emit(photo.url);
        }
        input.value = '';
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadError.set(
          typeof err.error === 'string'
            ? err.error
            : err.error?.detail
              ?? err.error?.message
              ?? 'Unable to upload photo. Please try again.',
        );
        input.value = '';
      },
    });
  }
  protected setMainPhoto(photo: Photo): void {
    if (!this.canUpload || photo.isMain || this.settingMainPhotoId() !== null) {
      return;
    }

    this.settingMainPhotoId.set(photo.id);
    this.setMainPhotoError.set(null);
    this.membersService.setMainPhoto(photo.id).subscribe({
      next: () => {
        this.photos.update((current) =>
          current.map((currentPhoto) => ({
            ...currentPhoto,
            isMain: currentPhoto.id === photo.id,
          })),
        );
        this.updateCurrentUserPhoto(photo);
        this.mainPhotoChanged.emit(photo.url);
        this.settingMainPhotoId.set(null);
      },
      error: (err) => {
        this.setMainPhotoError.set(
          typeof err.error === 'string'
            ? err.error
            : err.error?.message ?? 'Unable to set the main photo. Please try again.',
        );
        this.settingMainPhotoId.set(null);
      },
    });
  }

  private updateCurrentUserPhoto(photo: Photo): void {
    const currentUser = this.accountService.currentUser();
    if (!currentUser || currentUser.id !== photo.memberId) {
      return;
    }

    const updatedUser = { ...currentUser, imageUrl: photo.url };
    this.accountService.currentUser.set(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
}
