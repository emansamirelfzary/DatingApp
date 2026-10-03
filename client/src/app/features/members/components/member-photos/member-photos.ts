import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../services/members';

@Component({
  selector: 'app-member-photos',
  imports: [],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos  implements OnInit {
  private membersService = inject(MembersService);
  

  ngOnInit(): void {
    const id=

    this.membersService.getMemberPhotos('emma-id').subscribe({
      next: (photos) => {
        console.log('Member photos loaded:', photos);
      },
      error: (err) => {
        console.error('Error fetching member photos:', err);
      }
    });
  
}
}
