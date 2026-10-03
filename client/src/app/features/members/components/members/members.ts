import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MembersService } from '../../services/members';
import { Member } from '../../interfaces/member.interface';
import { AccountService } from '../../../../core/services/account-service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members implements OnInit {
  private memberService = inject(MembersService);
  private accountService = inject(AccountService);

  private allMembers = signal<Member[]>([]);
  protected members = computed(() => {
    const currentUserId = this.accountService.currentUser()?.id;
    return this.allMembers().filter((member) => member.id !== currentUserId);
  });

  ngOnInit(): void {
    this.loadMembers();
  }

  private loadMembers(): void {
    this.memberService.getMembers().subscribe({
      next: (members) => {
        this.allMembers.set(members);
      },
      error: (err) => {
        console.error('Error fetching members:', err);
      }
    });
  }
}
