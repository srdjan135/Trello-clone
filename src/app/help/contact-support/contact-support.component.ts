import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-contact-support',
  standalone: true,
  imports: [
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    FormsModule,
  ],
  templateUrl: './contact-support.component.html',
  styleUrl: './contact-support.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSupportComponent {
  constructor(
    private snackBar: MatSnackBar,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    const data = {
      category: form.value.category,
      subject: form.value.subject,
      message: form.value.message,
    };

    this.api.contactSupport(data).subscribe(() => {
      this.snackBar.open(
        'Your message has been sent successfully! Our support team will contact you soon.',
        'Close',
        {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        },
      );
      form.reset();
      this.cdr.markForCheck();
    });
  }
}
