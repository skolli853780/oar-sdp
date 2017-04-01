import { Injectable } from '@angular/core';
import { Http, Response,URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import * as _ from 'lodash';
import { Config } from '../config/env.config';


/**
 * This class provides the Search service with methods to search for records from tha rmm.
 */
@Injectable()
export class SearchService {
  //private RestAPIURL: string = Config.API;
  private rmmApi : string = Config.RMMAPI;

  /**
   * Creates a new SearchService with the injected Http.
   * @param {Http} http - The injected Http.
   * @constructor
   */
  constructor(private http: Http) {}
   /**
   * Returns an Observable for the HTTP GET request for the JSON resource.
   * @return {string[]} The Observable for the HTTP request.
   */
  searchById(searchValue:string): Observable<string[]> {
    //alert(this.rmmApi);
        searchValue = '@id=' + searchValue;
    //return this.http.get('http://10.200.222.250:8082/oar-rmm-service/records?' + searchValue)
    //return this.http.get(this.rmmApi+'?' + searchValue)
    return this.http.get('http://localhost:8082/oar-rmm-service/records?')
    .map((res: Response) => res.json().ResultData)
    .catch((error: any) => Observable.throw(error.json()));
    
  }
}

