import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private accountService= inject(AccountService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder).nonNullable;
  protected loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false],
  });


  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.accountService.login({ email, password }).subscribe({
      next: (response) => {
        this.loginForm.reset();
        this.router.navigateByUrl('/home');
        console.log('Login successful:', response);
        // Handle successful login, e.g., navigate to a different page or store the token
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Handle login error, e.g., show an error message to the user
      }
    });
  }

}
