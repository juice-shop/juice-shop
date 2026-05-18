import {
  AfterViewChecked,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  input,
  type OnInit,
  output,
  viewChild
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
  implements OnInit, AfterViewChecked {
  readonly inputElement = viewChild<ElementRef>('input')

  readonly placeholder = input('')
  readonly alwaysOpen = input(false)
  readonly onBlur = output<string>()
  readonly onClose = output<void>()
  readonly onEnter = output<string>()
  readonly onFocus = output<string>()
  readonly onOpen = output<void>()

  searchVisible = false
  private pendingFocus = false

  @HostBinding('class.search-expanded') get expanded () {
    return this.searchVisible
  }

  ngOnInit (): void {
    if (this.alwaysOpen()) {
      this.searchVisible = true
    }
  }

  ngAfterViewChecked (): void {
    const el = this.inputElement()
    if (this.pendingFocus && el) {
      el.nativeElement.focus()
      this.pendingFocus = false
    }
  }

  public close (): void {
    if (!this.alwaysOpen()) {
      this.searchVisible = false
    }
    this.value = ''
    this.updateChanges()
    this.onClose.emit()
  }

  public open (): void {
    this.searchVisible = true
    this.pendingFocus = true
    this.onOpen.emit()
  }

  onBlurring (searchValue: string) {
    if (!searchValue && !this.alwaysOpen()) {
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
