import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';

import { environment } from './../../../environments/environment';

import 'rxjs/add/operator/toPromise';

/*
*	Base api service class
*/
@Injectable()
export abstract class BaseApiService {
  // http header
  headers: Headers;

  // user jwt
  token: string;

  // model for searching
  abstract model: string;

  /*
	* constructor
	* param{Http} http service
	*/
  constructor(public http: Http, public AuthService: AuthService) {}

  /*
	* Get base url (should be implemented on the child class)
	*/
  abstract getBaseUrl(): string;

  /*
	* Return a list of items
	* param{Object} where
	* param{Number} limit
	* param{Number} skip
	* param{Number} sort
	* param{Number} populate
	*/
  findAll(
    where: object = {},
    limit: number = 20,
    skip: number = 0,
    sort: string = 'id ASC',
    populate: string = null
  ) {
    return this.http
      .get(this.getBaseUrl(), {
        headers: this._getHeader(),
        params: {
          where,
          limit,
          skip,
          sort,
          populate
        }
      })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
	* Return a single item
	* param{string} id
	*/
  findOne(id: string, populate: string = null) {
    console.log('populate', populate);
    return this.http
      .get(`${this.getBaseUrl()}/${id}`, {
        headers: this._getHeader(),
        params: {
          populate
        }
      })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
	* Save the resource
	* param{Object} data resource
	*/
  save(data: object) {
    return this.http
      .post(this.getBaseUrl(), data, { headers: this._getHeader() })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
	* Destroy the resource
	* param{string} id
	*/
  destroy(id: string) {
    return this.http
      .delete(`${this.getBaseUrl()}/${id}`, { headers: this._getHeader() })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
	* Update the resource
	* param{string} id
	* param{Object} data
	*/
  update(id: string, data: object) {
    return this.http
      .put(`${this.getBaseUrl()}/${id}`, data, { headers: this._getHeader() })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
  * Get the cound of the resource
  * @param{object} filter. Object to establish a criteria on the count query.
  */
  count(filter: object = {}) {
    return this.http
      .get(`${this.getBaseUrl()}/count`, {
        headers: this._getHeader(),
        params: {
          filter
        }
      })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
  * Remove the association
  * @param{string} uuid. the model uuid over we are going to remove from.
  * @param{string} association. The association name of the model.
  * @param{string} fk. the foreign key of the relationship object to remove.
  */
  remove(uuid: string, association: string, fk: string) {
    return this.http
      .delete(`${this.getBaseUrl()}/${uuid}/${association}/${fk}`, { headers: this._getHeader() })
      .toPromise()
      .then(response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

  /*
  * Search accros the models by the name email and RFC depending the case
  * @param{any} criteria. the criteria parameters.
  */
  search(criteria: any) {
    criteria.models = this.model;
    return this.http
      .get(`${environment.baseUrl}search`, {
        headers: this._getHeader(),
        params: criteria
      })
      .toPromise()
      .then( response => response.json())
      .catch(err => Promise.reject(this._handleError(err.message || err)));
  }

 /*
  * Logut in case the error is the expired token.
  * @param{any} err. the model uuid over we are going to remove from.
  */
  _handleError(err: any) {
    console.log('_handleError', err);
    if (typeof err !== 'string' && err.status === 401 && err.statusText === 'Unauthorized') {
      console.log('went to logout fro the token expired');
      this.AuthService.logout();
    }
    return err;
  }

  /*
  * Set the token to the header
  */
  _getHeader(): Headers {
    this.token = this.AuthService.getToken();
    this.headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}`});
    return this.headers;
  }
}
