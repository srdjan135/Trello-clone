import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ClickOutsideDirective } from '../../../../../../shared/directives/click-outside.directive';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Column } from '../../../../../../models/column.model';

@Component({
  selector: 'app-create-column',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatButton,
    ClickOutsideDirective,
    FormsModule,
  ],
  templateUrl: './create-column.component.html',
  styleUrl: './create-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateColumnComponent implements OnInit {
  boardId!: string;
  isAddingList: boolean = false;
  @Output() newColumn = new EventEmitter<Column>();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;
    });
  }

  createBoardColumn(form: NgForm) {
    if (form.invalid) return;

    const columnTitle = form.value.columnTitle;
    this.api.createColumn(columnTitle, this.boardId).subscribe((res) => {
      form.reset();
      this.newColumn.emit(res.column);
      this.cdr.markForCheck();
    });
  }
}
