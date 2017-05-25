import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AngularFireModule} from 'angularfire2';
import {MdButtonModule, MdCardModule, MdCheckboxModule, MdInputModule, MdListModule, MdProgressBarModule, MdSidenavModule, MdSnackBarModule, MdToolbarModule} from '@angular/material';

import {AppComponent} from './app.component';
import {CommonModule} from "@angular/common";
import {SearchService} from "./Github/search.service";
import {SearchComponent} from "./Github/search.component";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireAuthModule} from "angularfire2/auth";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {environment} from "../environments/environment";


@NgModule({
    declarations: [
        AppComponent, SearchComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        CommonModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        BrowserAnimationsModule, MdButtonModule, MdCheckboxModule,
        MdSnackBarModule, MdInputModule, MdToolbarModule,
        MdCardModule, MdListModule, MdSidenavModule, MdProgressBarModule,
    ],
    providers: [SearchService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
