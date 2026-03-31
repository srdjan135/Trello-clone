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
import { AuthFormBaseComponent } from '../auth-form-base.component';

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
export class SignInComponent extends AuthFormBaseComponent {
  constructor(private authService: AuthService) {
    super();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    const userData = new FormData();
    userData.append('email', form.value.email);
    userData.append('password', form.value.password);

    this.authService.signIn(userData).subscribe({
      next: () => {},
      error: (error) => this.handleFormErrors(form, error),
    });
  }
}
