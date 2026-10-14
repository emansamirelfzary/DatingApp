import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Members } from './members';
import { MembersService } from '../../services/members';
import { Likes } from '../../services/likes';
import { AccountService } from '../../../../core/services/account-service';
import { Member } from '../../interfaces/member.interface';

describe('Members', () => {
  let component: Members;
  let fixture: ComponentFixture<Members>;
  let getMembersSpy: ReturnType<typeof vi.fn>;
  const currentMember: Member = {
    id: 'current-user',
    displayName: 'Current User',
    email: 'current@example.com',
    dateOfBirth: '1990-01-01',
    photoUrl: null,
    age: 36,
    city: 'City',
    country: 'Country',
    gender: 'female',
    bio: null,
    created: '2020-01-01',
    lastActive: '2026-10-03',
  };
  const otherMember: Member = { ...currentMember, id: 'other-user', displayName: 'Other User' };

  beforeEach(async () => {
    getMembersSpy = vi.fn(() => of({
      items: [currentMember, otherMember],
      metadata: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 5,
        totalCount: 2,
      },
    }));

    await TestBed.configureTestingModule({
      imports: [Members],
      providers: [
        provideRouter([]),
        {
          provide: MembersService,
          useValue: {
            getMembers: getMembersSpy,
          },
        },
        {
          provide: Likes,
          useValue: {
            likeIds: signal<string[]>([]),
            toggleLike: vi.fn(() => of(undefined)),
          },
        },
        { provide: AccountService, useValue: { currentUser: signal({ id: currentMember.id }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Members);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not include the current user in the members list', () => {
    const renderedMembers = fixture.nativeElement.textContent as string;
    expect(renderedMembers).toContain(otherMember.displayName);
    expect(renderedMembers).not.toContain(currentMember.displayName);
  });

  it('sends selected filters when applying', () => {
    (component as unknown as { filterForm: { patchValue: (v: object) => void } }).filterForm.patchValue({
      gender: 'male',
      minAge: 21,
      maxAge: 40,
      orderBy: 'created',
    });
    component.applyFilters();

    expect(getMembersSpy).toHaveBeenCalledWith(1, 5, {
      gender: 'male',
      minAge: 21,
      maxAge: 40,
      orderBy: 'created',
    });
  });

  it('sends alphabetical sorting when selected', () => {
    (component as unknown as { filterForm: { patchValue: (v: object) => void } }).filterForm.patchValue({ orderBy: 'displayNameDesc' });
    component.applyFilters();

    expect(getMembersSpy).toHaveBeenLastCalledWith(1, 5, {
      gender: undefined,
      minAge: 18,
      maxAge: 100,
      orderBy: 'displayNameDesc',
    });
  });
});
