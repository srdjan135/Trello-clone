import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { User } from '../models/user.model';
import { ApiService } from '../shared/services/api.service';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [MatFormField, MatLabel, MatError, MatInput, FormsModule, MatButton],
  templateUrl: './manage-account.component.html',
  styleUrl: './manage-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageAccountComponent implements OnInit {
  user!: User;
  originalUser!: User;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.originalUser = { ...this.user };
      this.cdr.markForCheck();
    });
  }

  getIsDisabled(form: NgForm) {
    return (
      form.invalid ||
      (this.user.username === this.originalUser.username &&
        this.user.email === this.originalUser.email)
    );
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const username = form.value.username;
    const email = form.value.email;

    this.api.manageUser({ username, email }, this.user._id).subscribe((res) => {
      this.snackBar.open('User updated successfully!', 'Close', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
    });
  }
}
