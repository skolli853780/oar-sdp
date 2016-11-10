import { Component, OnInit } from '@angular/core';
import {SelectItem,DropdownModule} from 'primeng/primeng';
import { TaxonomyListService } from '../shared/taxonomy-list/index';
import { SearchFieldsListService } from '../shared/searchfields-list/index';
import { SearchService } from '../shared/search-service/index';
import {Router,NavigationExtras} from '@angular/router';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sdp-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
 })

export class HomeComponent implements OnInit {

    errorMessage: string;
    searchValue:string = '';
    advSearchValue:string[];
    taxonomies: SelectItem[];
    searchTaxonomyKey: string;
    display: boolean = false;
    showAdvancedSearch: boolean = false;
    rows: any[] ;
    fields: SelectItem[];
    ALL:string='All Fields';
    showDeleteButton:boolean = false;
    operators:SelectItem[];

  /**
     *
     */
  constructor(public taxonomyListService: TaxonomyListService, public searchFieldsListService : SearchFieldsListService, public searchService:SearchService, private router:Router) {
             this.taxonomies = [];
             this.fields = [];
    }

    /**
     *
     */
  ngOnInit() {
      this.getTaxonomies();
      this.getSearchFields();
      this.rows =  [{}];
      this.searchOperators();
  }

   showDialog() {
        this.display = true;
    }

    saveSearch()
    {
      this.searchValue = "";
      for(let i = 0; i < this.rows.length; i++) {
        if (typeof this.rows[i].column1 === "undefined")
        {
          this.rows[i].column1 = 'AND';
        }
        if (typeof this.rows[i].column2 === "undefined")
        {
          this.rows[i].column2 = 'searchphrase';
        }
        if (typeof this.rows[i].column3 === "undefined")
        {
          this.rows[i].column3 = '';
        }
        if (i > 0)
          this.searchValue += '&logicalOp=' + this.rows[i].column1 + '&' +  this.rows[i].column2 + '=' + this.rows[i].column3;
        else
          this.searchValue += this.rows[i].column2 + '=' + this.rows[i].column3;

      }
    }

    /**
     * Handle the nameListService observable
     */

    getTaxonomies() {
      this.taxonomyListService.get()
        .subscribe(
          taxonomies => this.taxonomies = this.toTaxonomiesItems(taxonomies),
          error => this.errorMessage = <any>error
        );
    }

  toTaxonomiesItems(taxonomies:any[]) {
    let items: SelectItem[] = [];
    items.push({label: 'All', value: ''});
    for (let taxonomy of taxonomies) {
      items.push({label: taxonomy.researchCategory, value: taxonomy.researchCategory});
    }
    return items;
  }

    getSearchFields() {
      this.searchFieldsListService.get()
        .subscribe(
          fields => this.fields = this.toFieldItems(fields),
          error =>  this.errorMessage = <any>error
        );
    }

  toFieldItems(fields:any[]) {
    let items :SelectItem[] = [];
    items.push({label:this.ALL, value:'All'});
    for (let field of fields) {
      items.push({label:field.fields, value:field.fields});
    }
    return items;
  }

  searchOperators()
  {
    this.operators = [];
    this.operators.push({label:'AND', value:'AND'});
    this.operators.push({label:'OR', value:'OR'});
    this.operators.push({label:'NOT', value:'NOT'});
  }

  search(searchValue:string,searchTaxonomyKey:string) {

            let params:NavigationExtras = {
                queryParams: { 'q': this.searchValue, 'key': this.searchTaxonomyKey ? this.searchTaxonomyKey:''}
            };

            this.router.navigate(['/search'], params);

    }

  advancedSearch(advSearch: boolean)
  {
    this.showAdvancedSearch = advSearch;
  }
    searchExample (popupValue:string)

    {
      this.display = false;
      this.searchValue = popupValue;
    }

    addRow ()
    {

      this.rows.push({});
      this.showDeleteButton = true;

    }

    deleteRow (rowIndex:number) {
      if (this.rows.length > 1) {
        this.rows.splice(rowIndex, 1);
        this.saveSearch();
      }

      if (this.rows.length == 1)
      {
        this.showDeleteButton = false;
      }
    }
}
