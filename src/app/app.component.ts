import {Component, OnInit, OnDestroy} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import {Repository} from './Github/search.service';
import {MdSnackBar} from '@angular/material';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { ViewEncapsulation} from '@angular/core';
import 'rxjs/add/operator/map'


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
    authSubscriber: ISubscription;
    public user;
    public list;
    public userId = '-';

    constructor(private afAuth: AngularFireAuth,
                private afDb: AngularFireDatabase,
                public snackBar: MdSnackBar) {
    }

    ngOnInit(): void {

        this.authSubscriber = this.afAuth.authState.subscribe(user => {
            this.user = user;

            if (user) {
                console.log(user);
                this.userId = user.uid;
                const providerData = user.providerData[0];
                const name = providerData.displayName ? providerData.displayName : providerData.email;

                this.afDb.object(`/users/${this.userId}/user`).update(providerData);
                this.showSnackbar(`Logged in as ${name}`);


                this.list = this.afDb.list('/users/' + this.userId + '/watch').map(_watches => {
                    return _watches.map(_watch => {
                        _watch.info = this.afDb.object(`/latest_feeds/${_watch.$key}`);
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
        let snack = this.snackBar.open(message);
        setTimeout(() => snack.dismiss(), 3000);
    }

    public doGithubLogin() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GithubAuthProvider());
    }

    public doLogout() {
        this.afAuth.auth.signOut();
    }

    public addRepo(repo: Repository) {
        this.afDb.object(`/users/${this.userId}/watch/${repo.id}`).set(repo.full_name);
    }

    removeRepo(repoId) {
        this.afDb.object(`/users/${this.userId}/watch/${repoId}`).remove();
    }
}
