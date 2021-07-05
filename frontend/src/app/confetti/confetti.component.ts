import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import confetti from 'canvas-confetti'

@Component({
  selector: 'app-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.scss']
})
export class ConfettiComponent implements OnInit {

  constructor(private renderer: Renderer2, private elementRef: ElementRef) { }

  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas')
    this.elementRef.nativeElement.appendChild(canvas)
    const myConfetti = confetti.create(canvas, {
      resize: true
    })
    myConfetti();
    // setTimeout(canvas.remove(),6000)

  }

}
