import { type ControlValueAccessor } from '@angular/forms'

export abstract class AbstractControlValueAccessor
implements ControlValueAccessor {
  value: string

  /**
   * Invoked when the model has been changed
   */
  onChange: (_: any) => void = () => {}
  /**
   * Invoked when the model has been touched
   */
  onTouched: () => void = () => {}
  /**
   * Method that is invoked on an update of a model.
   */
  updateChanges () {
    this.onChange(this.value)
  }

  /**
   * Writes a new item to the element.
   * @param value the value
   */
  writeValue (value: string): void {
    this.value = value
    this.updateChanges()
  }

  /**
   * Registers a callback function that should be called when the control's value changes in the UI.
   * @param fn
   */
  registerOnChange (fn: any): void {
    this.onChange = fn
  }

  /**
   * Registers a callback function that should be called when the control receives a blur event.
   * @param fn
   */
  registerOnTouched (fn: any): void {
    this.onTouched = fn
  }
}
