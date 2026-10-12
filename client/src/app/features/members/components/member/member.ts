import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { AccountService } from '../../../../core/services/account-service';
import { MembersService } from '../../services/members';
import { Member as MemberData } from '../../interfaces/member.interface';

@Component({
  selector: 'app-member',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './member.html',
  styleUrl: './member.css',
})
export class Member {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private membersService = inject(MembersService);
  currentUser = inject(AccountService).currentUser;
  get memberId(): string | null { return this.route.snapshot.paramMap.get('id'); }
  member = signal<MemberData | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.member.set(null);
        const id = params.get('id');
        return id ? this.membersService.getMember(id) : of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(member => this.member.set(member));
  }
}
