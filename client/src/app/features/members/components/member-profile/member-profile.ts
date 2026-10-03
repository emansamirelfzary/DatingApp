import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersService } from '../../services/members';
import { Member } from '../../interfaces/member.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-member-profile',
  imports: [RouterLink, DatePipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private membersService = inject(MembersService);

  member = signal<Member | null>(null);

  ngOnInit(): void {
   
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.membersService.getMember(id).subscribe({
      next: (data) => {
        console.log('Member loaded:', data);
        this.member.set(data);

          }      });
    } 
    console.log(this.member());
  }
}
