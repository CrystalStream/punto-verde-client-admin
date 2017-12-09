import { NotificationService } from 'ng2-notify-popup';
import { Component, OnInit } from '@angular/core';

import { UserService } from '../shared/services/api/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  // array to hold users
  users: Array<any>;

  // loading object
  loading: {[key: string]: any} = {
    all: false,
  };

  // promises array
  promises: Promise<any>[] = [];

  /*
  * constructor
  * @param{UserService} UserService
  */
  constructor(private UserService: UserService, private NotifyService: NotificationService) { }

  /*
  * init
  */
  ngOnInit() {
    this.promises.push(this.getAllUsers());
    Promise.all(this.promises)
      .then(() => {
        this.loading.all = true;
      })
      .catch( err => {
        console.error(JSON.parse('{Code: \'500\', message: err, method: \'UsersComponent.ngOnInit()\'}'));
      });
  }

  /*
  * Get all the users from the API.
  */
  getAllUsers(): Promise<any> {
    return this.UserService.findAll()
      .then( (response: any) => {
        this.users = response.data;
        console.log('this.users', this.users);
      })
      .catch( err => {
        console.error(JSON.parse('{Code: \'500\', message: err, method: \'UsersComponent.getAllUsers()\'}'));
      });
  }

  /*
  * Delete a user by the given uuid
  * @param{string} uuid
  */
  deleteUser(uuid) {
    this.UserService.destroy(uuid)
      .then( response => {
        if (response.code === 'OK') {
          this.users = this.users.filter( user => user.uuid !== uuid);
          this.NotifyService.show(`Usuario eliminado`,
          { position: 'top', location: '#main-wrapper', duration: '2000', type: 'error' });
        } else {
          this.NotifyService.show(`Error al eliminar`,
          { position: 'top', location: '#main-wrapper', duration: '2000', type: 'error' });
        }
      })
      .catch( err => console.error(JSON.parse(`{'error': ${err}}`)));
  }

}
