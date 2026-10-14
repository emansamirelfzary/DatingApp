import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { UserWithRoles } from '../../interfaces/user-with-roles.interface';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  readonly availableRoles = ['Admin', 'Moderator', 'Member'];

  users = signal<UserWithRoles[]>([]);
  // Selected roles per user, keyed by user id, so edits can be applied individually.
  selectedRoles = signal<Record<string, string[]>>({});
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  savingUserId = signal<string | null>(null);
  saveError = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.adminService
      .getUsersWithRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.selectedRoles.set(
            Object.fromEntries(users.map((user) => [user.id, [...user.roles]])),
          );
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set('Could not load users. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  hasRole(userId: string, role: string): boolean {
    return (this.selectedRoles()[userId] ?? []).includes(role);
  }

  toggleRole(userId: string, role: string, checked: boolean): void {
    this.successMessage.set(null);
    this.saveError.set(null);
    this.selectedRoles.update((current) => {
      const roles = current[userId] ? [...current[userId]] : [];
      const index = roles.indexOf(role);
      if (checked && index === -1) {
        roles.push(role);
      } else if (!checked && index !== -1) {
        roles.splice(index, 1);
      }
      return { ...current, [userId]: roles };
    });
  }

  hasChanges(userId: string): boolean {
    const original = this.users().find((user) => user.id === userId)?.roles ?? [];
    const selected = this.selectedRoles()[userId] ?? [];
    if (original.length !== selected.length) {
      return true;
    }
    return !original.every((role) => selected.includes(role));
  }

  saveRoles(userId: string): void {
    if (this.savingUserId()) {
      return;
    }

    const roles = this.selectedRoles()[userId] ?? [];
    this.savingUserId.set(userId);
    this.saveError.set(null);
    this.successMessage.set(null);

    this.adminService
      .editRoles(userId, roles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedRoles) => {
          this.users.update((users) =>
            users.map((user) =>
              user.id === userId ? { ...user, roles: updatedRoles } : user,
            ),
          );
          this.selectedRoles.update((current) => ({
            ...current,
            [userId]: [...updatedRoles],
          }));
          this.savingUserId.set(null);
          this.successMessage.set('Roles updated successfully.');
        },
        error: (err) => {
          this.saveError.set(
            typeof err?.error === 'string'
              ? err.error
              : 'Could not update roles. Please try again.',
          );
          this.savingUserId.set(null);
        },
      });
  }
}
