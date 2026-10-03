import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MembersService } from '../../services/members';
import { Member } from '../../interfaces/member.interface';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members implements OnInit {
  private memberService = inject(MembersService);

  protected members = signal<Member[]>([]);

  ngOnInit(): void {
    this.loadMembers();
  }

  private loadMembers(): void {
    this.memberService.getMembers().subscribe({
      next: (members) => {
        this.members.set(members);
      },
      error: (err) => {
        console.error('Error fetching members:', err);
      }
    });
  }
}
