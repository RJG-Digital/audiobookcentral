import { Injectable } from '@angular/core';
import { AccordianData, Book } from '../models/bookModels';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LodashService {

  constructor() { }

  public createAuthorArray(books: Book[]): AccordianData[] {
    const authorAccordianData: AccordianData[] = [];
    const dict = _(books).groupBy(x => x.author).value();
    _.forOwn(dict, (value, key) => { 
      authorAccordianData.push({title: key, data: value});
    });
    authorAccordianData.sort((a: AccordianData, b: AccordianData) => (a.title > b.title) ? 1 : -1);
    return authorAccordianData;
  }

  public createAlphabetArray(books: Book[]): AccordianData[] {
    const alphabetAccordianData: AccordianData[] = [];
    const dict = _(books).groupBy(x => x.title[0].toUpperCase()).value();
    _.forOwn(dict, (value, key) => { 
      alphabetAccordianData.push({title: key, data: value});
    });
    alphabetAccordianData.sort((a: AccordianData, b: AccordianData) => (a.title > b.title) ? 1 : -1);
    return alphabetAccordianData;
  }
}
