import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthFormBaseComponent } from '../auth-form-base.component';

@Component({
  selector: 'app-sign-up',
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
    RouterLink,
    CommonModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent extends AuthFormBaseComponent {
  constructor(private authService: AuthService) {
    super();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    const userData = new FormData();
    userData.append('username', form.value.username);
    userData.append('email', form.value.email);
    userData.append('password', form.value.password);

    this.authService.signUp(userData).subscribe({
      next: () => {},
      error: (error) => this.handleFormErrors(form, error),
    });
  }
}
