import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { SearchService, TaxonomyListService, SearchFieldsListService } from '../shared/index';
import { ActivatedRoute }     from '@angular/router';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription';
import { SelectItem } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { MenuItem, Checkbox } from 'primeng/primeng';
import * as _ from 'lodash';
import { Config } from '../shared/config/env.config';

declare var jQuery: any;

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component ({
    moduleId: module.id,
    selector: 'sdp-search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
    providers:[TaxonomyListService, SearchService, SearchFieldsListService]
})



export class SearchPanelComponent implements OnInit, OnDestroy {
  layoutCompact: boolean = true;
  layoutMode: string = 'horizontal';
  darkMenu: boolean = false;
  selectedThemesNode: any[];
  selectedComponentsNode: any[];
  profileMode: string = 'inline';
  msgs: Message[] = [];
  exception: string;
  noResults: boolean;
  checked: boolean = false;
  errorMsg: string;
  status: string;
  errorMessage: string;
  queryAdvSearch: string;
  searchResults: any[] = [];
  errorMessageArray: string[];
  themesTree: any[];
  componentsTree: any[];
  searchValue: string;
  taxonomies: SelectItem[];
  sortItems: SelectItem[];
  fields: SelectItem[];
  fieldsArray: any[];
  displayFields: string[] = [];
  selectedFields: string[] = ['Resource Description','Subject keywords'];
  searchTaxonomyKey: string;
  suggestedTaxonomies: string[];
  suggestedTaxonomyList: string[];
  nodeExpanded: boolean = true;
  sortItemKey: string;
  showMoreLink: boolean = false;
  cols: any[];
  rows: number = 5;
  columnOptions: SelectItem[];
  searching: boolean = false;
  keywords: string[];
  themes: SelectItem[] = [];
  themesWithCount: SelectItem[] = [];
  componentsWithCount: SelectItem[] = [];
  components: SelectItem[] = [];
  authors: string[] = [];
  themesAllArray: string[] = [];
  componentsAllArray: string[] = [];
  componentsAllDupArray: string[] = [];
  filteredResults: any[] = [];
  keyword: string;
  Keywords: string[] = [];
  selectedKeywords: string[] = [];
  selectedThemes: string[] = [];
  selectedComponents: string[] = [];
  selectedAuthor: string[] = [];
  suggestedKeywords: string[] = [];
  suggestedThemes: string[] = [];
  suggestedAuthors: string[] = [];
  ALL: string = 'All';
  unspecified: string = 'Unspecified';
  unspecifiedCount: number = 0;
  filteredKeywords: string[] = [];
  filteredThemes: string[] = [];
  filteredAuthors: string[] = [];
  selectedAuthorDropdown: boolean = false;
  items: MenuItem[];
  uniqueComp: string[] = [];
  uniqueThemes: string[] = [];
  sortable: any[] = [];
  showMoreResearchTopics: boolean = false;
  private _routeParamsSubscription: Subscription;
  private PDRAPIURL: string = Config.PDRAPI;


  /**
   * Creates an instance of the SearchPanel
   *
   */
  constructor(private route: ActivatedRoute, private el: ElementRef, public taxonomyListService: TaxonomyListService, public searchService: SearchService, public searchFieldsListService: SearchFieldsListService) {
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

  /**
   * Populate taxonomy items
   */
  toTaxonomiesItems(taxonomies: any[]) {
    let items: SelectItem[] = [];
    items.push({label: 'All Research', value: ''});
    for (let taxonomy of taxonomies) {
      items.push({label: taxonomy.label, value: taxonomy.label});
    }
    return items;
  }

  /**
   * Populate list of themes from Search results
   */

  collectThemes(searchResults: any[]) {
    let themes: SelectItem[] = [];
    let themesArray: string[] = [];
    let uniqueThemes: string[] = [];
    let themesAllArray: string[] = [];
    let topics: string;
    this.themesAllArray = [];
    this.unspecifiedCount = 0;
    for (let resultItem of searchResults) {
      this.uniqueThemes = [];
      if (typeof resultItem.topic !== 'undefined' && resultItem.topic.length > 0) {
        for (let topic of resultItem.topic) {
          topics = _.split(topic.tag, ':')[0];
          this.uniqueThemes.push(topics);
          if (themesArray.indexOf(topics) < 0) {
            themes.push({label: topics, value: topics});
            themesArray.push(topics);
          }

        }
        console.log("themes array" + this.uniqueThemes.filter(this.onlyUnique));
        this.themesAllArray = this.themesAllArray.concat(this.uniqueThemes.filter(this.onlyUnique));
      } else {
        this.unspecifiedCount += 1;
      }

    }
    return themes;
  }

  /**
   * Populate list of themes from Search results
   */

  collectComponents(searchResults: any[]) {
    let components: SelectItem[] = [];
    let componentsArray: string[] = [];
    let componentsAllArray: string[] = [];
    let resultItemComp: string[] = [];
    let comp: any[] = [];
    let compType: string;
    this.componentsAllArray = [];
    for (let resultItem of searchResults) {
      if (resultItem.inventory && resultItem.inventory !== null && resultItem.inventory.length > 0) {
        this.uniqueComp = [];
        for (let resultItemComponents of resultItem.inventory) {
          comp = resultItemComponents.byType;
          for (let type of comp) {
            let compType = type.forType;
            if ((_.includes(compType, 'nrd')) && !(_.includes(compType, 'Hidden'))) {
              //this.componentsAllArray.push(_.startCase(_.split(compType, ':')[1]));
              this.uniqueComp.push(_.startCase(_.split(compType, ':')[1]));
              if (componentsArray.indexOf(compType) < 0) {
                components.push({
                  label: _.startCase(_.split(compType, ':')[1]),
                  value: _.startCase(_.split(compType, ':')[1])
                });
                componentsArray.push(compType);
              }
            }
          }
          this.uniqueComp = this.uniqueComp.filter(this.onlyUnique);
        }
        for (let comp of this.uniqueComp) {
          this.componentsAllArray.push(comp);
        }
      }
    }
    return components;
  }

  /**
   * Populate list of Authors from Search results
   */

  collectAuthors(searchResults: any[]) {
    console.log("searchresults length" + searchResults.length);
    let authors: string[] = [];
    for (let resultItem of searchResults) {
      if (resultItem.contactPoint && resultItem.contactPoint !== null && resultItem.contactPoint.fn !== null) {
        if (authors.indexOf(resultItem.contactPoint.fn) < 0) {
          authors.push(resultItem.contactPoint.fn);
        }
      }
    }
    return authors;
  }

  /**
   * Populate list of keywords from search results
   */

  collectKeywords(searchResults: any[]) {
    let kwords: string[] = [];
    for (let resultItem of searchResults) {
      if (resultItem.keyword && resultItem.keyword !== null && resultItem.keyword.length > 0) {
        for (let keyword of resultItem.keyword) {
          if (kwords.indexOf(keyword) < 0) {
            kwords.push(keyword);
          }
        }
      }
    }
    return kwords;
  }

  /**
   * If Search is successful populate list of keywords themes and authors
   */

  onSuccess(searchResults: any[]) {
    this.noResults = false;
    this.themesWithCount = [];
    this.componentsWithCount = [];
    this.sortable = [];
    this.searchResults = searchResults;
    this.filteredResults = searchResults;
    this.keywords = this.collectKeywords(searchResults);
    this.themes = this.collectThemes(searchResults);

    // collect Research topics with count
    this.collectThemesWithCount();
    this.components = this.collectComponents(searchResults);
    // collect Resource features with count
    this.collectComponentsWithCount();

    this.themesTree = [{
      label: 'Research Topics -',
      "expanded": 'true',
      children: this.themesWithCount
    }];
    this.componentsTree = [{
      label: 'Record has -',
      "expanded": 'true',
      children: this.componentsWithCount
    }];
    this.authors = this.collectAuthors(searchResults);
    this.clearFilters();
    if (this.filteredResults.length < 5) {
      this.rows = 20;
    }
  }

  /**
   * If search is unsuccessful push the error message
   */
  onError(error: any[]) {
    this.searchResults = [];
    this.filteredResults = [];
    this.keywords = [];
    this.themes = [];
    this.msgs = [];
    this.noResults = true;
    this.exception = (<any>error).ex;
    this.errorMsg = (<any>error).message;
    this.status = (<any>error).httpStatus;
    this.msgs.push({severity: 'error', summary: this.errorMsg + ':', detail: this.status + ' - ' + this.exception});
  }

  showMoreResTopics() {
    this.themesWithCount = [];
    this.sortable = [];
    this.themesTree = [];
    for (let theme in (_.countBy(this.themesAllArray))) {
      this.sortable.push([theme, _.countBy(this.themesAllArray)[theme]]);
    }
    if (this.unspecifiedCount > 0) {
      this.sortable.push(['Unspecified', this.unspecifiedCount]);
    }
    this.sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
    for (var key in this.sortable) {
      this.themesWithCount.push({
        label: this.sortable[key][0] + "-" + this.sortable[key][1],
        value: this.sortable[key][0]
      });
    }

    this.themesTree = [{
      label: 'Research Topics -',
      "expanded": 'true',
      children: this.themesWithCount
    }];
    this.showMoreResearchTopics = true;
  }

  showLessResTopics() {
    this.themesWithCount = [];
    this.sortable = [];
    this.themesTree = [];
    for (let theme in (_.countBy(this.themesAllArray))) {
      this.sortable.push([theme, _.countBy(this.themesAllArray)[theme]]);
    }
    if (this.unspecifiedCount > 0) {
      this.sortable.push(['Unspecified', this.unspecifiedCount]);
    }
    this.sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
    for (var key in this.sortable.slice(0, 5)) {
      this.themesWithCount.push({
        label: this.sortable[key][0] + "-" + this.sortable[key][1],
        value: this.sortable[key][0]
      });
    }

    this.themesTree = [{
      label: 'Research Topics -',
      "expanded": 'true',
      children: this.themesWithCount
    }];
    this.showMoreResearchTopics = false;
  }

  /**
   * call the Search service with parameters
   */
  search(searchValue: string, searchTaxonomyKey: string, queryAdvSearch: string) {
    this.searching = true;
    this.keyword = '';
    let that = this;
    return this.searchService.searchPhrase(this.searchValue, this.searchTaxonomyKey, queryAdvSearch)
      .subscribe(
        searchResults => that.onSuccess(searchResults),
        error => that.onError(error)
      );
  }

  getTaxonomySuggestions() {
    this.taxonomyListService.get()
      .subscribe(
        taxonomies => this.suggestedTaxonomies = this.toTaxonomySuggestedItems(taxonomies),
        error => this.errorMessage = <any>error
      );
  }

  /**
   * Taxonomy items list
   */
  toTaxonomySuggestedItems(taxonomies: any[]) {
    let items: string[] = [];
    for (let taxonomy of taxonomies) {
      items.push(taxonomy.label);
    }
    return items;
  }

  /**
   * Filter keywords for suggestive search
   */
  filterTaxonomies(event: any) {
    let suggTaxonomy = event.query;
    this.suggestedTaxonomyList = [];
    for (let i = 0; i < this.suggestedTaxonomies.length; i++) {
      let keyw = this.suggestedTaxonomies[i];
      if (keyw.toLowerCase().indexOf(suggTaxonomy.toLowerCase()) >= 0) {
        this.suggestedTaxonomyList.push(keyw);
      }
    }
  }

  /**
   * Filter keywords for suggestive search
   */
  nodeExpand(event: any) {
    this.nodeExpanded = true;

  }

  /**
   * Filter keywords for suggestive search
   */
  nodeCollapse(event: any) {
    this.nodeExpanded = false;

  }

  collectThemesWithCount() {
    this.sortable = [];
    this.themesWithCount = [];
    for (let theme in (_.countBy(this.themesAllArray))) {
      this.sortable.push([theme, _.countBy(this.themesAllArray)[theme]]);
    }
    if (this.unspecifiedCount > 0) {
      this.sortable.push(['Unspecified', this.unspecifiedCount]);
    }
    this.sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
    for (var key in this.sortable.slice(0, 5)) {
      this.themesWithCount.push({
        label: this.sortable[key][0] + "-" + this.sortable[key][1],
        value: this.sortable[key][0]
      });
    }
    if (this.sortable.length > 5) {
      this.showMoreLink = true;
    } else {
      this.showMoreLink = false;
    }
  }

  collectComponentsWithCount() {
    this.componentsWithCount = [];
    for (let comp of this.components) {
      let count: any;
      count = _.countBy(this.componentsAllArray, _.partial(_.isEqual, comp.value))['true'];
      this.componentsWithCount.push({label: comp.label + "-" + count, value: comp.value});
    }
  }

  /**
   * Filter keywords for suggestive search
   */
  filterKeywords(event: any) {
    let keyword = event.query;
    this.suggestedKeywords = [];
    for (let i = 0; i < this.keywords.length; i++) {
      let keyw = this.keywords[i];
      if (keyw.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) {
        this.suggestedKeywords.push(keyw);
      }
    }

    this.suggestedKeywords = this.sortAlphabetically(this.suggestedKeywords);
  }

  /**
   * Filter authors for suggestive search
   */

  filterAuthors(event: any) {
    let author = event.query;
    this.suggestedAuthors = [];
    for (let i = 0; i < this.authors.length; i++) {
      let autho = this.authors[i];
      if (autho.toLowerCase().indexOf(author.toLowerCase()) >= 0) {
        this.suggestedAuthors.push(autho);
      }
    }
    this.suggestedAuthors = this.sortAlphabetically(this.suggestedAuthors);
    //this.suggestedAuthors.splice(0, 0, 'All');

  }

  /**
   * Sort arrays alphabetically
   */
  sortAlphabetically(array: string[]) {
    var sortedArray: string[] = array.sort((n1, n2) => {
      if (n1 > n2) {
        return 1;
      }
      if (n1 < n2) {
        return -1;
      }
      return 0;
    });
    return sortedArray;
  }

  /**
   * Display suggested authors on dropdown click
   */
  onAuthorDropdownClick(event: any) {
    //var tmp = this.suggestedAuthors; // wierd, have to do this, otherwise nothing display
    this.suggestedAuthors = [];
    //mimic remote call
    setTimeout(() => {
      this.suggestedAuthors = this.authors;
    }, 100);
  }

  /**
   * Filter themes
   */
  filterByTheme(searchResults: any[], selectedThemes: string[]) {
    var filteredResults: any[] = [];
    if (selectedThemes.length > 0 && selectedThemes.indexOf(this.ALL) < 0) {
      if (searchResults !== null && searchResults.length > 0) {
        for (let resultItem of searchResults) {
          if (resultItem.topic !== null) {
            if (this.containsAllThemes(resultItem.topic, selectedThemes)) {
              filteredResults.push(resultItem);
            }
          }
        }
      }
      return filteredResults;
    } else {
      return searchResults;
    }
  }

  /**
   * Filter Components
   */
  filterByComponents(searchResults: any[], selectedComponents: string[]) {
    var filteredResults: any[] = [];

    if (selectedComponents.length > 0) {
      if (searchResults !== null && searchResults.length > 0) {
        let components: SelectItem[] = [];
        let componentsArray: string[] = [];
        let resultItemComp: string[] = [];
        for (let resultItem of searchResults) {
          if (resultItem.inventory && resultItem.inventory !== null && resultItem.inventory.length > 0) {
            for (let resultItemComponents of resultItem.inventory) {
              let comp = resultItemComponents.byType;
              if (comp !== null) {
                for (let type of comp) {
                  let compType = type.forType;
                  compType = _.startCase(_.split(compType, ':')[1]);
                  for (let comps of selectedComponents) {
                    if (comps !== null) {
                      if (compType.indexOf(comps) === 0) {
                        filteredResults.push(resultItem);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return filteredResults;
    } else {
      return searchResults;
    }
  }

  /**
   * Filter Components
   */
  filterByThemes(searchResults: any[], selectedThemes: string[]) {
    var filteredResults: any[] = [];
    console.log("selected theme" + selectedThemes);
    if (typeof selectedThemes !== 'undefined') {
      if (searchResults !== null && searchResults.length > 0) {
        let themes: SelectItem[] = [];
        let resultItemThemes: string[] = [];
        for (let resultItem of searchResults) {
          if (resultItem.topic && resultItem.topic !== null && resultItem.topic.length > 0) {
            for (let resultItemThemes of resultItem.topic) {
              let theme = resultItemThemes.tag;
              let themeStr = _.split(theme, ':')[0];
              for (let selTheme of selectedThemes) {
                if (themeStr.indexOf(selTheme) === 0) {
                  filteredResults.push(resultItem);
                }
              }
            }
          } else {
            if (_.includes(selectedThemes, 'Unspecified')) {
              filteredResults.push(resultItem);
            }
          }
        }
        return filteredResults;
      } else {
        return searchResults;
      }
    }
  }

  /**
   * filter authors
   */

  filterByAuthor(searchResults: any[], selectedAuthor: any[]) {
    var filteredResults: any[] = [];
    if (selectedAuthor.length > 0 && selectedAuthor.indexOf(this.ALL) < 0) {
      console.log("filterbyauthor" + selectedAuthor);
      if (searchResults !== null && searchResults.length > 0) {
        for (let resultItem of searchResults) {
          if (resultItem.contactPoint && resultItem.contactPoint !== null &&
            this.containsAllAuthors(resultItem.contactPoint.fn, selectedAuthor)) {
            console.log("filterbyauthor inside for if--------------------------");
            filteredResults.push(resultItem);
          }
        }
      }
      return filteredResults;
    } else {
      return searchResults;
    }
  }

  /**
   * filter results
   */
  filterResults(event: any) {
    this.selectedThemes = [];
    this.selectedComponents = [];
    let themeSelected: boolean = false;
    let componentSelected: boolean = false;
    let authorSelected: boolean = false;
    let keywordSelected: boolean = false;

    // Research Topics selected
    if (this.selectedThemesNode != null && this.selectedThemesNode.length > 0) {
      for (let theme of this.selectedThemesNode) {
        if (typeof theme.value !== 'undefined' && theme.value !== 'undefined') {
          themeSelected = true;
          console.log("inside selected theme" + theme.value);
          this.selectedThemes.push(theme.value);
        }
      }
      this.filteredResults = this.filterByThemes(this.searchResults, this.selectedThemes);
      this.filteredResults = this.filteredResults.filter(this.onlyUnique);
      this.authors = this.collectAuthors(this.filteredResults);
      if (this.selectedKeywords != null && this.selectedKeywords.length > 0) {
      } else {
        this.suggestedKeywords = this.collectKeywords(this.filteredResults);
      }
      if (this.selectedComponentsNode != null && this.selectedComponentsNode.length > 0) {
      } else {
        this.components = this.collectComponents(this.filteredResults);
        this.collectComponentsWithCount();
      }
    }
    console.log("test" + this.filteredResults.length);
    // Resource Features selected

    if (this.selectedComponentsNode != null && this.selectedComponentsNode.length > 0) {
      console.log("inside selectedcomponent" + this.selectedComponentsNode);
      for (let comp of this.selectedComponentsNode) {
        if (typeof comp.value !== 'undefined' && comp.value !== 'undefined') {
          componentSelected = true;
          this.selectedComponents.push(comp.value);
        }
      }
      this.filteredResults = this.filterByComponents(this.searchResults, this.selectedComponents);
      this.filteredResults = this.filteredResults.filter(this.onlyUnique);
      if (this.selectedAuthor != null && this.selectedAuthor.length > 0) {
      } else {
        this.authors = this.collectAuthors(this.filteredResults);
      }
      if (this.selectedKeywords != null && this.selectedKeywords.length > 0) {
      } else {
        this.suggestedKeywords = this.collectKeywords(this.filteredResults);
      }
      if (this.selectedThemesNode != null && this.selectedThemesNode.length > 0) {
      } else {
        this.themes = this.collectThemes(this.filteredResults);
        this.collectThemesWithCount();
      }
    }

    if (this.selectedAuthor !== null && this.selectedAuthor.length > 0) {
      console.log("inside author" + this.selectedAuthor);
      authorSelected = true;
      this.filteredResults = this.filterByAuthor(this.searchResults, this.selectedAuthor);
      if (this.selectedThemesNode != null && this.selectedThemesNode.length > 0) {
      } else {
        console.log("inside themes");
        this.themes = this.collectThemes(this.filteredResults);
        this.collectThemesWithCount();
      }
      if (this.selectedComponentsNode != null && this.selectedComponentsNode.length > 0) {
      } else {
        console.log("inside components");
        this.components = this.collectComponents(this.filteredResults);
        this.collectComponentsWithCount();
      }
      if (this.selectedKeywords != null && this.selectedKeywords.length > 0) {
      } else {
        console.log("inside keywords");
        this.suggestedKeywords = this.collectKeywords(this.filteredResults);
      }
    }

    if (this.selectedKeywords !== null && this.selectedKeywords.length > 0) {
      keywordSelected = true;
      this.filteredResults = this.filterByKeyword(this.searchResults, this.selectedKeywords);
      if (this.selectedThemesNode != null && this.selectedThemesNode.length > 0) {
      } else {
        this.themes = this.collectThemes(this.filteredResults);
        this.collectThemesWithCount();
      }
      if (this.selectedComponentsNode != null && this.selectedComponentsNode.length > 0) {
      } else {
        this.components = this.collectComponents(this.filteredResults);
        this.collectComponentsWithCount();
      }
      if (this.selectedAuthor != null && this.selectedAuthor.length > 0) {
      } else {
        this.authors = this.collectAuthors(this.filteredResults);
      }
    }

    if (!themeSelected && !componentSelected && !authorSelected && !keywordSelected) {
      console.log("nothing selected");
      this.filteredResults = this.searchResults;
      this.suggestedThemes = [];
      this.suggestedKeywords = [];
      this.suggestedAuthors = [];
      this.selectedAuthor = null;
      this.selectedKeywords = [];
      this.selectedThemes = [];
      this.selectedThemesNode = [];
      this.selectedComponents = [];
      this.selectedComponentsNode = [];
      this.selectedAuthorDropdown = false;
      this.authors = this.collectAuthors(this.filteredResults);
      this.suggestedKeywords = this.collectKeywords(this.filteredResults);
      this.components = this.collectComponents(this.filteredResults);
      this.collectComponentsWithCount();
      this.themes = this.collectThemes(this.filteredResults);
      this.collectThemesWithCount();
    }

    this.themesTree = [{
      label: 'Research Topics -',
      "expanded": 'true',
      children: this.themesWithCount
    }];
    this.componentsTree = [{
      label: 'Record has -',
      "expanded": 'true',
      children: this.componentsWithCount
    }];
  }


  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }


  /**
   * clear filters
   */
  clearFilters() {
    this.filteredResults = this.searchResults;
    this.suggestedThemes = [];
    this.suggestedKeywords = [];
    this.suggestedAuthors = [];
    this.selectedAuthor = null;
    this.selectedKeywords = [];
    this.selectedThemes = [];
    this.selectedThemesNode = [];
    this.selectedComponents = [];
    this.selectedComponentsNode = [];
    this.selectedAuthorDropdown = false;
    this.authors = this.collectAuthors(this.filteredResults);
    this.suggestedKeywords = this.collectKeywords(this.filteredResults);
    this.components = this.collectComponents(this.filteredResults);
    this.collectComponentsWithCount();
    this.themes = this.collectThemes(this.filteredResults);
    this.collectThemesWithCount();
    this.themesTree = [{
      label: 'Research Topics -',
      "expanded": 'true',
      children: this.themesWithCount
    }];
    this.componentsTree = [{
      label: 'Record has -',
      "expanded": 'true',
      children: this.componentsWithCount
    }];
  }

  /**
   * clear author filter
   */
  clearAuthorFilter() {
    this.filteredResults = this.searchResults;
    this.suggestedAuthors = [];
    this.selectedAuthor = null;
    this.selectedAuthorDropdown = false;

    this.suggestedThemes = [];
    this.suggestedKeywords = [];
    this.selectedKeywords = [];
    this.selectedThemes = [];
    this.selectedThemesNode = [];
    this.selectedComponents = [];
    this.selectedComponentsNode = [];
    this.selectedAuthorDropdown = false;
    this.authors = this.collectAuthors(this.filteredResults);
    this.suggestedKeywords = this.collectKeywords(this.filteredResults);
    this.components = this.collectComponents(this.filteredResults);
    this.collectComponentsWithCount();
    this.themes = this.collectThemes(this.filteredResults);
    this.collectThemesWithCount();
    this.themesTree = [{
      label: 'Research Topics -',
      "expanded": 'true',
      children: this.themesWithCount
    }];
    this.componentsTree = [{
      label: 'Record has -',
      "expanded": 'true',
      children: this.componentsWithCount
    }];
  }

  /**
   *
   * @param resultKeywords
   * @param keywords
   * @returns {boolean}
   */
  containsAllKeywords(resultKeywords: string[], keywords: string[]) {
    for (let keyw of keywords) {
      if (resultKeywords.indexOf(keyw) === -1)
        return false;
    }
    return true;
  }

  /**
   *
   * @param resultAuthors
   * @param Authors
   * @returns {boolean}
   */
  containsAllAuthors(resultAuthors: string[], authors: string[]) {
    for (let keyw of authors) {
      if (resultAuthors.indexOf(keyw) === -1)
        return false;
    }
    return true;
  }


  containsAllThemes(resultThemes: any[], themes: string[]) {
    for (let theme of themes) {
      if (resultThemes !== null) {
        for (let result of resultThemes) {
          if (result.tag !== null) {
            if ((result.tag).indexOf(theme)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  filterByKeyword(searchResults: any[], selectedKeywords: any[]) {
    var filteredResults: any[] = [];
    if (selectedKeywords.length > 0 && selectedKeywords.indexOf(this.ALL) < 0) {
      if (searchResults !== null && searchResults.length > 0) {
        for (let resultItem of searchResults) {
          if (resultItem.keyword && resultItem.keyword !== null &&
            this.containsAllKeywords(resultItem.keyword, selectedKeywords)) {
            filteredResults.push(resultItem);
          }
        }
      }
      return filteredResults;
    } else {
      return searchResults;
    }
  }

  encodeString(url: string, param: string) {
    var urlString = url + encodeURIComponent(param);
    window.open(urlString);
  }

  openURL(url: string) {
    window.open(url);
  }

  getSearchFields() {
    this.searchFieldsListService.get()
      .subscribe(
        fields => this.fields = this.toSortItems(fields),
        error => this.errorMessage = <any>error
      );
  }

  /**
   * Advanced Search fields dropdown
   */
  toSortItems(fields: any[]) {
    this.fieldsArray = fields;
    let items: SelectItem[] = [];
    let sortItems: SelectItem[] = [];
    this.displayFields = [];
    //for (let field of fields) {
    console.log("hello");
    for (let field of fields) {
      if (_.includes(field.tags, 'filterable')) {
        if (field.type !== 'object') {
          console.log("sort items" + field.label);
          if (field.name !== 'component.topic.tag') {
            sortItems.push({label: field.label, value: field.name});
          }
          if (field.label !== 'Resource Title') {
            if (field.name !== 'component.topic.tag') {
              this.displayFields.push(field.label);
            }
          }
        }
      }
    }
    ;
    //sortItems = _.sortBy(sortItems, ['label','value']);
    return sortItems;
  }

  SortByFields() {
    this.selectedFields = [];
    this.filteredResults = _.sortBy(this.filteredResults, this.sortItemKey);
    console.log("inside sort fields" + this.sortItemKey);
    for (let field of this.fieldsArray) {
      if (field.name == this.sortItemKey) {
        this.selectedFields.push(field.label);
        console.log("field label" + field.label);
      }
    }
    return this.filteredResults;
  }


  ResetSelectedFields() {
    this.selectedFields = ['Resource Description','Subject keywords'];
    this.checked = false;
  }

  SelectAllFields() {
    this.selectedFields = [];
    if (this.checked) {
      for (let field of this.fieldsArray) {
        if (_.includes(field.tags, 'filterable')) {
          if (field.type !== 'object') {
            if (field.label !== 'Resource Title') {
              if (field.name !== 'component.topic.tag') {
                this.selectedFields.push(field.label);
              }
            }
          }
        }
      }
    }
  }


  /**
     * Get the params OnInit
     */
  ngOnInit() {
    this.getSearchFields();
    this.getTaxonomySuggestions();
    this._routeParamsSubscription = this.route.queryParams.subscribe(params => {
      this.searchValue =params['q'];
      this.searchTaxonomyKey=params['key'];
      this.queryAdvSearch = params['queryAdvSearch'];
      this.getTaxonomies();
      this.search(this.searchValue,this.searchTaxonomyKey,this.queryAdvSearch);
  });
  }

  ngOnDestroy() {
      this._routeParamsSubscription.unsubscribe();
    }
}
