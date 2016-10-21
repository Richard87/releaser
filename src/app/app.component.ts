import {Component, Inject} from '@angular/core';
import {AngularFire, FirebaseAuth, AuthProviders, AuthMethods} from "angularfire2";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private af: AngularFire, @Inject(FirebaseAuth) public auth: FirebaseAuth) {}


  public doGithubLogin() {
    this.auth.login({
      method:AuthMethods.Popup,
      provider: AuthProviders.Github
    })
  }

  public doLogout() {
    this.auth.logout();
  }
}
