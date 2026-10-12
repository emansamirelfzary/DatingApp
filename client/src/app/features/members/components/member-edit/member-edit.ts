import { Component, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Member, UpdateMember } from '../../interfaces/member.interface';
import { MembersService } from '../../services/members';
import { AccountService } from '../../../../core/services/account-service';

@Component({
  selector: 'app-member-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './member-edit.html',
})
export class MemberEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private membersService = inject(MembersService);
  private accountService = inject(AccountService);
  member = signal<Member | null>(null);
  isSaving = false;
  saveError: string | null = null;
  private formBuilder = inject(FormBuilder).nonNullable;
  protected form = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.maxLength(50)]],
    dateOfBirth: ['', Validators.required],
    gender: ['', [Validators.required, Validators.maxLength(30)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
    bio: ['', Validators.maxLength(500)],
  });
  protected readonly today = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    (this.route.parent?.paramMap ?? this.route.paramMap).pipe(
      switchMap(params => this.membersService.getMember(params.get('id') ?? '')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: member => {
        this.member.set(member);
        if (member.id !== this.accountService.currentUser()?.id) {
          void this.router.navigate(['/matches', member.id]);
          return;
        }
        this.form.reset({
          displayName: member.displayName,
          dateOfBirth: member.dateOfBirth.slice(0, 10),
          gender: member.gender,
          city: member.city,
          country: member.country,
          bio: member.bio ?? '',
        });
      },
      error: () => { this.saveError = 'Could not load your profile. Please try again.'; },
    });
  }

  hasUnsavedChanges(): boolean { return this.form.dirty; }

  canDeactivate(): boolean {
    return !this.form.dirty || window.confirm('Discard your unsaved profile changes?');
  }

  cancelEditing(): void { void this.router.navigate(['/matches', this.member()?.id]); }

  @HostListener('window:beforeunload', ['$event'])
  protectUnsavedChanges(event: BeforeUnloadEvent): void {
    if (this.form.dirty) { event.preventDefault(); event.returnValue = ''; }
  }

  submit(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }
    const member = this.member();
    if (!member) return;
    this.isSaving = true;
    this.saveError = null;
    this.membersService.updateMember(member.id, this.form.getRawValue() satisfies UpdateMember).subscribe({
      next: updated => {
        const current = this.accountService.currentUser();
        if (current?.id === updated.id) {
          const user = { ...current, displayName: updated.displayName };
          this.accountService.currentUser.set(user);
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.isSaving = false;
        this.form.markAsPristine();
        void this.router.navigate(['/matches', updated.id]);
      },
      error: err => {
        this.saveError = typeof err.error === 'string' ? err.error : 'Could not save your profile. Please try again.';
        this.isSaving = false;
      },
    });
  }
}
