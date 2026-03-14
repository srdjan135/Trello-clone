import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Card } from '../../../../../../../../models/card.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCheckbox, MatIconButton, MatIcon, MatTooltip],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input({ required: true }) card!: Card;
}
