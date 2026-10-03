import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersService } from '../../services/members';
import { Photo } from '../../interfaces/member.interface';

@Component({
  selector: 'app-member-photos',
  imports: [RouterLink],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  private route = inject(ActivatedRoute);
  private membersService = inject(MembersService);
  protected photos = signal<Photo[]>([]);
  protected memberId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.memberId = id;

    this.membersService.getMemberPhotos(id).subscribe({
      next: (photos) => {
        this.photos.set(photos);
      },
      error: (err) => {
        console.error('Error fetching member photos:', err);
      }
    });
  }
}
