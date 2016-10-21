import {Output, EventEmitter} from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {Component} from "@angular/core/src/metadata/directives";

@Component({
    selector: 'search',
    template: `
      <md-input
        type="text" #value
        placeholder="Search for GitHub repositories..."
        #search
        (change)="onSearch.emit(search.value)"></md-input>
  `
})
export class SearchComponent{
    @Output()
    private onSearch: EventEmitter<string> = new EventEmitter<string>();

}