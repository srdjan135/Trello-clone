import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Workspace } from '../../../models/workspace';
import { ApiService } from '../../../shared/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ClickStopPropagationDirective } from '../../../shared/directives/click-stop-propagation.directive';
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatMenuModule,
    MatCheckboxModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    ClickStopPropagationDirective,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  workspaceId!: string;
  workspace!: Workspace;
  deleteControl = new FormControl('');
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((v) => {
      this.workspaceId = v.get('workspaceId')!;
      this.cdr.markForCheck();
    });

    this.api.getWorkspaces().subscribe((res) => {
      this.workspace = res.workspaces.find((w) => w._id === this.workspaceId)!;
      this.cdr.markForCheck();
    });
  }

  get IsDisabledButton() {
    return this.deleteControl.value !== this.workspace.name;
  }

  showEditWorkspaceForm() {
    this.isEditing = true;
    this.cdr.markForCheck();
  }

  cancelEdit() {
    this.isEditing = false;
    this.cdr.markForCheck();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const name = form.value.name;
    const description = form.value.description;
    const isPrivate = form.value.isPrivate;

    this.api
      .updateWorkspace({ name, description, isPrivate }, this.workspaceId)
      .subscribe((res) => {
        this.workspace = res.updatedWorkspace;
        this.isEditing = false;
        this.cdr.markForCheck();
        this.snackBar.open('Workspace update successfully', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      });
  }

  deleteWorkspace() {
    if (this.deleteControl.value !== this.workspace.name) {
      return;
    }
    this.api.deleteWorkspace(this.workspaceId).subscribe(() => {
      this.router.navigate(['/boards']);
      this.snackBar.open('Workspace delete successfully', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      this.cdr.markForCheck();
    });
  }
}
