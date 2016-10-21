import {Injectable, Inject} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export class SearchService {
    API_URL = "https://api.github.com/search";

    constructor(
        private _http: Http
    ) {}

    search(terms): Observable<Repository[]> {
        const searchURL = `${this.API_URL}/repositories?q=${terms}&sort=stars`;
        return this._http
            .get(searchURL)
            .map((response: Response) => response.json().items);
    }
}

interface User {
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