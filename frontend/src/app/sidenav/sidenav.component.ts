import { ChallengeService } from '../Services/challenge.service'
import { Component, OnInit, EventEmitter, NgZone, Output }from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { AdministrationService } from '../Services/administration.service'

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  public applicationName = 'OWASP Juice Shop'
  public gitHubRibbon = true
  public isExpanded = true
  public showSubmenu: boolean = false
  public isShowing = false
  public scoreBoardVisible: boolean = false
  public version: string = ''

  @Output() public sidenavToggle = new EventEmitter()

  constructor (private administrationService: AdministrationService, private challengeService: ChallengeService,
    private ngZone: NgZone, private io: SocketIoService) { }

  ngOnInit () {

    this.administrationService.getApplicationVersion().subscribe((version: any) => {
      if (version) {
        this.version = 'v' + version
      }
    },(err) => console.log(err))

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
    this.sidenavToggle.emit()
  }
}
