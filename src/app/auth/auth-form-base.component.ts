import { NgForm } from '@angular/forms';
import { signal } from '@angular/core';

export abstract class AuthFormBaseComponent {
  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  protected handleFormErrors(form: NgForm, error: any) {
    if (error.error?.errors) {
      error.error.errors.forEach((err: any) => {
        form.controls[err.field]?.setErrors({ backend: err.message });
      });
    }
  }
}
