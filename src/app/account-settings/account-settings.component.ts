import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../shared/services/api.service';
import { User } from '../models/user.model';
import { ClickStopPropagationDirective } from '../shared/directives/click-stop-propagation.directive';
import { AuthService } from '../shared/services/auth.service';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    MatMenuModule,
    ClickStopPropagationDirective,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent implements OnInit {
  confirmDeleteAccountCtrl = new FormControl('');
  user!: User;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.cdr.markForCheck();
    });
  }

  deleteAccount() {
    if (this.confirmDeleteAccountCtrl.value !== this.user.username) return;

    this.api.deleteAccount().subscribe(() => {
      this.auth.logout();
      this.cdr.markForCheck();
    });
  }
}
