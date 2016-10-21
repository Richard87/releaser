import {Component, Inject, OnInit, OnDestroy, ViewContainerRef} from '@angular/core';
import {AngularFire, FirebaseAuth, AuthProviders, AuthMethods} from "angularfire2";
import {Subscriber, Observable} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
import {SearchService, Repository} from "./Github/search.service";
import {MdSnackBar, MdSnackBarConfig} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  authSubscriber: ISubscription;
  repositories: Observable<Repository[]>;
  private user;
  private list;
  private userId = "-";
  private searching = false;
  private $searching;
  private $completed;

  constructor(
      private af: AngularFire,
      @Inject(FirebaseAuth) public auth: FirebaseAuth,
      private searchService: SearchService,
      private snackBar: MdSnackBar,
      private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {

    this.authSubscriber = this.af.auth.subscribe(user => {
      this.user = user;

      console.log(user);
      if (user) {
        this.userId = user.uid;
        this.list = this.af.database.list('/users/' + this.userId + '/watch');
        this.af.database.object("/users/" + this.userId + "/user",).update(user.github);

        this.showSnackbar(`Logged in as ${user.github.displayName}`);
      } else {
        this.showSnackbar(`Logged out.`);
      }
    });
    this.$searching = this.searchService.onSearch.subscribe(() => this.searching = true);
    this.$completed = this.searchService.onComplete.subscribe(() => this.searching = false);
  }

  ngOnDestroy(): void {
    this.authSubscriber.unsubscribe();
    this.$searching.unsubscribe();
    this.$completed.unsubscribe();
  }

  showSnackbar(message: string) {
    let config = new MdSnackBarConfig(this.viewContainerRef);
    this.snackBar.open(message, `Close`, config);
  }

  public doGithubLogin() {
    this.auth.login({
      method:AuthMethods.Popup,
      provider: AuthProviders.Github
    })
  }

  public onSearch(data) {
    this.repositories = this.searchService.search(data);
  }

  public addRepo(repo: Repository) {
    this.af.database.object(`/users/${this.userId}/watch/${repo.id}`).set(repo.full_name);
  }

  public doLogout() {
    this.auth.logout();
  }
}
