import { Component, inject } from '@angular/core';
import { RegisterCreds } from '../../../shared/types/auth';
import { AccountService } from '../../../core/services/account-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
private accountService= inject(AccountService);
private router = inject(Router);

  protected creds : RegisterCreds={
    displayName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    country: '',
  };

  register() {
    this.accountService.register(this.creds).subscribe({
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
