import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  type OnInit,
  Output,
  ViewChild
} from '@angular/core'
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms'
import { AbstractControlValueAccessor } from './abstract-value-accessor'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-mat-search-bar',
  templateUrl: './mat-search-bar.component.html',
  styleUrls: ['./mat-search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatSearchBarComponent),
      multi: true
    }
  ],
  imports: [FormsModule, MatIconModule, MatButtonModule]
})
export class MatSearchBarComponent extends AbstractControlValueAccessor
  implements OnInit {
  @ViewChild('input') inputElement: ElementRef

  @Input() placeholder = ''
  @Input() alwaysOpen = false
  @Output() onBlur = new EventEmitter<string>()
  @Output() onClose = new EventEmitter<void>()
  @Output() onEnter = new EventEmitter<string>()
  @Output() onFocus = new EventEmitter<string>()
  @Output() onOpen = new EventEmitter<void>()

  searchVisible = false

  @HostBinding('class.search-expanded') get expanded () {
    return this.searchVisible
  }

  ngOnInit (): void {
    if (this.alwaysOpen) {
      this.searchVisible = true
    }
  }

  public close (): void {
    if (!this.alwaysOpen) {
      this.searchVisible = false
    }
    this.value = ''
    this.updateChanges()
    this.onClose.emit()
  }

  public open (): void {
    this.searchVisible = true
    this.inputElement.nativeElement.focus()
    this.onOpen.emit()
  }

  onBlurring (searchValue: string) {
    if (!searchValue && !this.alwaysOpen) {
      this.searchVisible = false
    }
    this.onBlur.emit(searchValue)
  }

  onEnterring (searchValue: string) {
    this.onEnter.emit(searchValue)
  }

  onFocussing (searchValue: string) {
    this.onFocus.emit(searchValue)
  }
}
