import { Component, inject } from '@angular/core';
import { RegisterCreds } from '../../../shared/types/auth';
import { AccountService } from '../../../core/services/account-service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder).nonNullable;

  protected registerForm = this.formBuilder.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    terms: [false],
  });

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { displayName, email, password, dateOfBirth, gender, city, country } = this.registerForm.getRawValue();
    const creds: RegisterCreds = { displayName, email, password, dateOfBirth, gender, city, country };
    this.accountService.register(creds).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.router.navigateByUrl('/matches');
      },
      error: (error) => {
        console.error('Registration failed:', error);
      }
  })
}
}
