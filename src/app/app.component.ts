import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import {AngularFire, FirebaseAuth, AuthProviders, AuthMethods} from "angularfire2";
import {Subscriber, Observable} from "rxjs";
import {ISubscription} from "rxjs/Subscription";
import {SearchService, Repository} from "./Github/search.service";

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

  constructor(
      private af: AngularFire,
      @Inject(FirebaseAuth) public auth: FirebaseAuth,
      private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.authSubscriber = this.af.auth.subscribe(user => {
      this.user = user;

      console.log(user);
      if (user) {
        this.userId = user.uid;
        this.list = this.af.database.list('/users/' + this.userId + '/watch');
        this.af.database.object("/users/" + this.userId + "/user",).update(user.github);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscriber.unsubscribe();
  }


  public doGithubLogin() {
    this.auth.login({
      method:AuthMethods.Popup,
      provider: AuthProviders.Github
    })
  }

  public onSearch(data) {
    console.log(data);
    this.repositories = this.searchService.search(data);
  }

  public addRepo(repo: Repository) {
    console.log(repo);
    this.af.database.object("/users/" + this.userId + "/watch/" + repo.id).set(repo.full_name);
  }

  public doLogout() {
    this.auth.logout();
  }
}
