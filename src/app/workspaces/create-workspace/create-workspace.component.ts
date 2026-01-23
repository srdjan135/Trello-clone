import { Component, Input } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatButton],
  templateUrl: './create-workspace.component.html',
  styleUrl: './create-workspace.component.scss',
})
export class CreateWorkspaceComponent {}
