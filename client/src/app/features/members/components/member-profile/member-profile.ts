import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersService } from '../../services/members';
import { Member } from '../../interfaces/member.interface';
import { DatePipe } from '@angular/common';
import { MemberPhotoList } from '../member-photo-list/member-photo-list';

@Component({
  selector: 'app-member-profile',
  imports: [RouterLink, DatePipe, MemberPhotoList],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private membersService = inject(MembersService);

  member = signal<Member | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.membersService.getMember(id).subscribe({
      next: (data) => {
        this.member.set(data);
      },
      error: (err) => {
        console.error('Error fetching member profile:', err);
      },
    });

  }
}
