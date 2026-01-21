import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatFormField,
    MatError,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSuffix,
    FormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(private authService: AuthService) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;

    const userData = new FormData();
    userData.append('email', email);
    userData.append('password', password);

    this.authService.signIn(userData).subscribe({
      next: (res) => {
        console.log('Login success', res);
      },
      error: (error) => {
        if (error.error?.errors) {
          error.error.errors.forEach((err: any) => {
            form.controls[err.field]?.setErrors({
              backend: err.message,
            });
          });
        }
      },
    });
  }
}
