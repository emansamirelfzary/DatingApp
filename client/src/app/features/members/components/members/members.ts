import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MembersService } from '../../services/members';
import { Member, MemberFilters } from '../../interfaces/member.interface';
import { AccountService } from '../../../../core/services/account-service';
import { PaginatedResult } from '../../../../shared/types/pagination';
import { Paginator } from '../../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [RouterLink, Paginator, ReactiveFormsModule],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members implements OnInit {
  private memberService = inject(MembersService);
  private accountService = inject(AccountService);
  private formBuilder = inject(FormBuilder).nonNullable;

  protected readonly filterForm = this.formBuilder.group({
    gender: [''],
    minAge: [18],
    maxAge: [100],
    orderBy: ['lastActive' as MemberFilters['orderBy']],
  });

  protected allMembers = signal<PaginatedResult<Member>>({
    items: [],
    metadata: {
      currentPage: 1,
      totalPages: 0,
      pageSize: 5,
      totalCount: 0,
    },
  });
  protected members = computed(() => {
    const currentUserId = this.accountService.currentUser()?.id;
    return this.allMembers().items.filter((member) => member.id !== currentUserId);
  });

  ngOnInit(): void {
    this.loadMembers();
  }

  applyFilters(): void {
    this.loadMembers(1, this.allMembers().metadata.pageSize);
  }

  resetFilters(): void {
    this.filterForm.reset({
      gender: '',
      minAge: 18,
      maxAge: 100,
      orderBy: 'lastActive',
    });
    this.applyFilters();
  }

  private loadMembers(
    pageNumber = this.allMembers().metadata.currentPage,
    pageSize = this.allMembers().metadata.pageSize,
  ): void {
    this.memberService.getMembers(pageNumber, pageSize, this.currentFilters()).subscribe({
      next: (members) => {
        this.allMembers.set(members);
      },
      error: (err) => {
        console.error('Error fetching members:', err);
      }
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.loadMembers(event.pageNumber, event.pageSize);
  }

  private currentFilters(): MemberFilters {
    const { gender, minAge, maxAge, orderBy } = this.filterForm.getRawValue();
    return {
      gender: gender || undefined,
      minAge,
      maxAge,
      orderBy: orderBy ?? 'lastActive',
    };
  }
}
