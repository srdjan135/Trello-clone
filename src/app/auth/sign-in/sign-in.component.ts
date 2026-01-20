import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSuffix,
    FormsModule,
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

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    const userData = new FormData();
    userData.append('email', email);
    userData.append('password', password);
  }
}
