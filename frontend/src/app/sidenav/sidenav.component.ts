import { ChallengeService } from '../Services/challenge.service'
import{Component, OnInit, EventEmitter, NgZone, Output}from '@angular/core';
import { SocketIoService } from '../Services/socket-io.service'

@Component({
selector: 'sidenav',
templateUrl: './sidenav.component.html',
styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

public applicationName = 'OWASP Juice Shop'
public gitHubRibbon = true
isExpanded = true;
showSubmenu: boolean = false;
isShowing = false;
public scoreBoardVisible: boolean = false


@Output() public sidenavToggle = new EventEmitter();

constructor(private challengeService: ChallengeService, private ngZone: NgZone, private io: SocketIoService) { }

  ngOnInit() {
    this.getScoreBoardStatus()

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', () => {
        this.getScoreBoardStatus()
      })
    })
  }

  isLoggedIn () {
    return localStorage.getItem('token')
  }

  getScoreBoardStatus () {
      this.challengeService.find({ name: 'Score Board' }).subscribe((challenges: any) => {
        this.ngZone.run(() => {
          this.scoreBoardVisible = challenges[0].solved
        })
      }, (err) => console.log(err))
    }

  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
