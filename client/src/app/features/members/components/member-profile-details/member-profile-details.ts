import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Member } from '../../interfaces/member.interface';
import { MemberPhotoList } from '../member-photo-list/member-photo-list';

@Component({
  selector: 'app-member-profile-details',
  imports: [DatePipe, RouterLink, MemberPhotoList],
  templateUrl: './member-profile-details.html',
})
export class MemberProfileDetails {
  member = input.required<Member>();
  canUploadPhotos = input(false);
  photoLinkLabel = input('View all');
  mainPhotoChanged = output<string>();
}
