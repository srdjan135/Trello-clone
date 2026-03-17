import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { Workspace } from '../../../../models/workspace';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { bgColorImages, bgImages } from './images';
import { ApiService } from '../../../../shared/services/api.service';
import { Board } from '../../../../models/board.model';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-create-board',
  standalone: true,
  imports: [
    MatRipple,
    MatInput,
    FormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatIconButton,
    MatIcon,
    MatButton,
  ],
  templateUrl: './create-board.component.html',
  styleUrl: './create-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBoardComponent {
  @Input({ required: true }) workspace!: Workspace;
  @Output() newBoard = new EventEmitter<Board>();

  @ViewChild('menuTrigger', { read: ElementRef }) trigger!: ElementRef;
  @ViewChild('menuTemplate')
  menuTemplate!: TemplateRef<any>;
  @ViewChild('menuVcr', { read: ViewContainerRef }) menuVcr!: ViewContainerRef;

  overlayRef!: OverlayRef;

  bgColorImages: string[] = bgColorImages;
  bgImages: string[] = bgImages;
  selectedBg: string = bgImages[0];

  constructor(
    private api: ApiService,
    private overlay: Overlay,
  ) {}

  onSubmit(form: NgForm) {
    this.api
      .createBoard({
        title: form.value.title,
        background: this.selectedBg,
        workspaceId: this.workspace._id,
      })
      .subscribe((res) => {
        this.newBoard.emit(res.board);
        form.reset();
      });
  }

  openMenu() {
    if (!this.overlayRef) {
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.trigger)
        .withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
            offsetX: 8,
          },

          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetX: 8,
          },

          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
            offsetX: -8,
          },

          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom',
            offsetX: -8,
          },
        ])
        .withPush(true);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });

      this.overlayRef.backdropClick().subscribe(() => {
        this.overlayRef.detach();
      });
    }

    if (!this.overlayRef.hasAttached()) {
      const portal = new TemplatePortal(this.menuTemplate, this.menuVcr);
      this.overlayRef.attach(portal);
    }
  }

  close() {
    this.overlayRef?.detach();
  }
}
