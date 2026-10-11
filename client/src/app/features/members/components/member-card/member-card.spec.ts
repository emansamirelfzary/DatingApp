import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { MemberCard } from './member-card';
import { Likes } from '../../services/likes';
import { Member } from '../../interfaces/member.interface';

describe('MemberCard', () => {
  let fixture: ComponentFixture<MemberCard>;
  let likeIds: ReturnType<typeof signal<string[]>>;
  let toggleLike: ReturnType<typeof vi.fn>;

  const member: Member = {
    id: 'member-1',
    displayName: 'Alex',
    email: 'alex@example.com',
    dateOfBirth: '1995-01-01',
    photoUrl: null,
    age: 31,
    city: 'London',
    country: 'UK',
    gender: 'female',
    bio: null,
    created: '2020-01-01',
    lastActive: '2026-10-03',
  };

  beforeEach(async () => {
    likeIds = signal<string[]>([]);
    toggleLike = vi.fn(() => of(undefined));

    await TestBed.configureTestingModule({
      imports: [MemberCard],
      providers: [
        provideRouter([]),
        {
          provide: Likes,
          useValue: { likeIds, toggleLike },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberCard);
    fixture.componentRef.setInput('member', member);
    fixture.detectChanges();
  });

  it('renders the member card and an accessible like button', () => {
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Like Alex"]',
    ) as HTMLButtonElement | null;

    expect(button).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Alex');
  });

  it('toggles liked state after the API request succeeds', () => {
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Like Alex"]',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(toggleLike).toHaveBeenCalledWith(member.id);
    expect(likeIds()).toEqual([member.id]);
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Unlike Alex"]'),
    ).not.toBeNull();
  });
});
