import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, AuthMethods } from 'angularfire2';


import { AppComponent } from './app.component';

// Must export the config
export const firebaseConfig = {
    apiKey: "AIzaSyA_tWprch4_iJKKcEg3CCAO9VwCjvKxY5I",
    authDomain: "releaseer-a6183.firebaseapp.com",
    databaseURL: "https://releaseer-a6183.firebaseio.com",
    storageBucket: "releaseer-a6183.appspot.com",
    messagingSenderId: "454541533417"
};

export const firebaseAuthConfig = {
  method: AuthMethods.Popup,
  remember: 'default'
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
