import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Members } from './members';
import { MembersService } from '../../services/members';
import { AccountService } from '../../../../core/services/account-service';
import { Member } from '../../interfaces/member.interface';

describe('Members', () => {
  let component: Members;
  let fixture: ComponentFixture<Members>;
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
    await TestBed.configureTestingModule({
      imports: [Members],
      providers: [
        provideRouter([]),
        { provide: MembersService, useValue: { getMembers: () => of([currentMember, otherMember]) } },
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
});
