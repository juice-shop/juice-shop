import { Component, ChangeDetectionStrategy } from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'warning-card',
  templateUrl: './warning-card.component.html',
  styleUrls: ['./warning-card.component.scss'],
  standalone: true
})
export class WarningCardComponent {}
