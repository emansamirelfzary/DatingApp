import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Member, UpdateMember } from '../../interfaces/member.interface';

@Component({
  selector: 'app-member-edit',
  imports: [FormsModule],
  templateUrl: './member-edit.html',
})
export class MemberEdit implements OnChanges {
  @ViewChild('editForm') private editForm?: NgForm;

  @Input({ required: true }) member!: Member;
  @Input() isSaving = false;
  @Input() saveError: string | null = null;

  @Output() save = new EventEmitter<UpdateMember>();
  @Output() cancel = new EventEmitter<void>();

  protected formValue: UpdateMember = this.emptyForm();
  protected readonly today = new Date().toISOString().slice(0, 10);

  hasUnsavedChanges(): boolean {
    return this.editForm?.dirty ?? false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['member'] && this.member) {
      this.formValue = {
        displayName: this.member.displayName,
        dateOfBirth: this.member.dateOfBirth.slice(0, 10),
        gender: this.member.gender,
        city: this.member.city,
        country: this.member.country,
        bio: this.member.bio ?? '',
      };
    }
  }

  submit(form: NgForm): void {
    if (!form.valid || this.isSaving) {
      form.control.markAllAsTouched();
      return;
    }

    this.save.emit({ ...this.formValue });
  }

  private emptyForm(): UpdateMember {
    return {
      displayName: '',
      dateOfBirth: '',
      gender: '',
      city: '',
      country: '',
      bio: '',
    };
  }
}
