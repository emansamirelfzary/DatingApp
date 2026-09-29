import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account-service';
import { Router } from '@angular/router';
import { LoginCreds } from '../../../shared/types/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private accountService= inject(AccountService);
  private router = inject(Router);

  protected creds = {} as LoginCreds;


  login() {
    this.accountService.login(this.creds).subscribe({
      next: (response) => {
        this.creds = { email: '', password: '' }; // Clear the credentials after successful login
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
