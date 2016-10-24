import {Injectable, Inject, EventEmitter, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {Output} from "@angular/core/src/metadata/directives";
import {MdSnackBar} from "@angular/material";

@Injectable()
export class SearchService {
    API_URL = "";

    @Output()
    public onComplete: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private _http: Http
    ) {}

    search(terms): Observable<Repository[]> {
        if (!terms)
            return Observable.of<Repository[]>([]);

        const searchURL = `https://api.github.com/search/repositories?q=${terms}&sort=stars`;
        return this._http
            .get(searchURL).cache()
            .map((response: Response) => {
                this.onComplete.emit(response.json().items);
                return response.json().items;
            });
    }
}

export interface User {
    login: string;
    html_url: string;
    avatar_url: string;
}

export interface Repository {
    id: number;
    name: string;
    html_url: string;
    open_issues_count: number;
    stargazers_count: number;
    full_name: string;
    owner: User;
}