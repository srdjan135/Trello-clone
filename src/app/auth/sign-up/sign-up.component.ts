import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
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
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(form: NgForm) {
    const username = form.value.username;
    const email = form.value.email;
    const password = form.value.password;

    const userData = new FormData();
    userData.append('username', username);
    userData.append('email', email);
    userData.append('password', password);
  }
}
