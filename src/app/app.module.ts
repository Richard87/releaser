import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, AuthMethods } from 'angularfire2';
import {MaterialModule} from '@angular/material';

import { AppComponent } from './app.component';
import {CommonModule, NgIf} from "@angular/common";
import {SearchService} from "./Github/search.service";
import {SearchComponent} from "./Github/search.component";

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
    AppComponent, SearchComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CommonModule,
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    MaterialModule.forRoot(),
  ],
  providers: [SearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
