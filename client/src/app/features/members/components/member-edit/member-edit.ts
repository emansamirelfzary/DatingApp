import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Member, UpdateMember } from '../../interfaces/member.interface';

@Component({
  selector: 'app-member-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './member-edit.html',
})
export class MemberEdit implements OnChanges {
  @Input({ required: true }) member!: Member;
  @Input() isSaving = false;
  @Input() saveError: string | null = null;

  @Output() save = new EventEmitter<UpdateMember>();
  @Output() cancel = new EventEmitter<void>();

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

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['member'] && this.member) {
      this.form.reset({
        displayName: this.member.displayName,
        dateOfBirth: this.member.dateOfBirth.slice(0, 10),
        gender: this.member.gender,
        city: this.member.city,
        country: this.member.country,
        bio: this.member.bio ?? '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue() satisfies UpdateMember);
  }
}
