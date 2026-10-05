import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '../../../../core/services/account-service';
import { MemberPhotoList } from '../member-photo-list/member-photo-list';

@Component({
  selector: 'app-member-photos',
  imports: [RouterLink, MemberPhotoList],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  protected memberId = signal('');
  protected currentUser = this.accountService.currentUser;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.memberId.set(id);
  }
}
