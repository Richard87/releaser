import {Component, Inject, OnInit, OnDestroy, ViewContainerRef, ViewChild} from '@angular/core';
import {AngularFire, FirebaseAuth, AuthProviders, AuthMethods} from "angularfire2";
import {Observable} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
import {Repository} from "./Github/search.service";
import {MdSnackBar, MdSnackBarConfig} from "@angular/material";
import {SearchComponent} from "./Github/search.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  @ViewChild(SearchComponent) searchComponent: SearchComponent;


  authSubscriber: ISubscription;
  repositories$: Observable<Repository[]>;
  private user;
  private list;
  private userId = "-";

  constructor(
      private af: AngularFire,
      @Inject(FirebaseAuth) public auth: FirebaseAuth,
      private snackBar: MdSnackBar,
      private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {

    this.authSubscriber = this.af.auth.subscribe(user => {
      this.user = user;

      if (user) {
        this.userId = user.uid;
        this.af.database.object("/users/" + this.userId + "/user",).update(user.github);
        this.showSnackbar(`Logged in as ${user.github.email}`);


        this.list = this.af.database.list('/users/' + this.userId + '/watch').map((_watches) => {
            return _watches.map((_watch) => {
                _watch.info = this.af.database.object(`/latest_feeds/${_watch.$key}`);
                return _watch;
            })
        });

      } else {
        this.showSnackbar(`Logged out.`);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscriber.unsubscribe();
  }


  showSnackbar(message: string) {
    let config = new MdSnackBarConfig(this.viewContainerRef);
    let sb = this.snackBar.open(message, ``, config);
    setTimeout(() => sb.dismiss(), 5000);
  }

  public doGithubLogin() {
    this.auth.login({
      method:AuthMethods.Popup,
      provider: AuthProviders.Github
    })
  }

  public doLogout() {
    this.auth.logout();
  }

  public showSearch() {
    this.searchComponent.show();
  }
  public addRepo(repo: Repository) {
    this.af.database.object(`/users/${this.userId}/watch/${repo.id}`).set(repo.full_name);
  }
  removeRepo(repoId) {
    this.af.database.object(`/users/${this.userId}/watch/${repoId}`).remove();
  }
}
