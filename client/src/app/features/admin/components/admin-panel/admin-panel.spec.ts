import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AdminPanel } from './admin-panel';
import { AdminService } from '../../services/admin';
import { UserWithRoles } from '../../interfaces/user-with-roles.interface';

describe('AdminPanel', () => {
  let fixture: ComponentFixture<AdminPanel>;
  let getUsersWithRoles: ReturnType<typeof vi.fn>;
  let editRoles: ReturnType<typeof vi.fn>;

  const users: UserWithRoles[] = [
    { id: 'user-1', email: 'admin@test.com', roles: ['Admin', 'Moderator'] },
    { id: 'user-2', email: 'member@test.com', roles: ['Member'] },
  ];

  beforeEach(async () => {
    getUsersWithRoles = vi.fn(() => of(users));
    editRoles = vi.fn(() => of(['Member', 'Moderator']));

    await TestBed.configureTestingModule({
      imports: [AdminPanel],
      providers: [
        { provide: AdminService, useValue: { getUsersWithRoles, editRoles } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanel);
    fixture.detectChanges();
  });

  it('loads and renders users with their roles', () => {
    const component = fixture.componentInstance;
    expect(getUsersWithRoles).toHaveBeenCalled();
    expect(component.users()).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('admin@test.com');
    expect(fixture.nativeElement.textContent).toContain('member@test.com');
  });

  it('detects selected roles and changes', () => {
    const component = fixture.componentInstance;
    expect(component.hasRole('user-1', 'Admin')).toBe(true);
    expect(component.hasRole('user-2', 'Admin')).toBe(false);

    expect(component.hasChanges('user-1')).toBe(false);
    component.toggleRole('user-2', 'Admin', true);
    expect(component.hasChanges('user-2')).toBe(true);
  });

  it('saves updated roles and applies the server response', () => {
    const component = fixture.componentInstance;
    component.toggleRole('user-2', 'Moderator', true);
    component.saveRoles('user-2');

    expect(editRoles).toHaveBeenCalledWith('user-2', ['Member', 'Moderator']);
    expect(component.successMessage()).toBe('Roles updated successfully.');
    expect(component.users().find((u) => u.id === 'user-2')?.roles).toEqual([
      'Member',
      'Moderator',
    ]);
  });

  it('shows a load error when the request fails', () => {
    getUsersWithRoles.mockReturnValue(
      throwError(() => new Error('failed')),
    );
    const localFixture = TestBed.createComponent(AdminPanel);
    localFixture.detectChanges();

    expect(localFixture.componentInstance.loadError()).toBe(
      'Could not load users. Please try again.',
    );
  });
});
