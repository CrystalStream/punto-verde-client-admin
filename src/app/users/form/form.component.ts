import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from './../../../environments/environment';

import { Observable } from 'rxjs/Observable';

import { UserService } from '../../shared/services/api/user.service';
import { SectorService } from '../../shared/services/api/sector.service';
import { NotificationService } from 'ng2-notify-popup';
import { ImageService } from '../../shared/services/api/image.service';

// for jquery
declare var $: any;

// for cloudinary widget uploader
declare var cloudinary: any;

@Component({
  selector: 'app-form-users',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  // Edit mode
  @Input() editMode: boolean = false;

  // Sectors array
  sectors: [{ [key: string]: any }];

  // user uuid
  userId: string;

  // promises array
  promises: Promise<any>[] = [];

  // userForm FormGroup
  userForm: FormGroup;

  // Default password value
  DEFAULT_PASSWORD: string = 'default123';

  // Notification error message
  notificationError: object = { position: 'top', location: '#main-wrapper', duration: '2200', type: 'error' };

  // Notification success message
  notificationSuccess: object = { position: 'top', location: '#main-wrapper', duration: '2200', type: 'success' };

  // user photos
  photos: object[] = [];

  /*
  * constructor
  * @param{UserService} UserService
  * @param{SectorService} SectorService
  * @param{ActivatedRoute} route
  * @param{Router} router
  */
  constructor(
    public UserService: UserService,
    public SectorService: SectorService,
    public route: ActivatedRoute,
    public router: Router,
    private NotifyService: NotificationService,
    public ImageService: ImageService
  ) {}

  /*
  * init
  */
  ngOnInit() {
    // init foundation js
    $(document).foundation();

    // Create the form
    this.userForm = new FormGroup({
      role: new FormControl('regular', Validators.required),
      RFC: new FormControl(),
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      age: new FormControl(),
      genre: new FormControl(),
      sector: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      assets: new FormControl(null)
    });

    /* EDIT MODE*/
    if (this.editMode) {
      this.route.params.subscribe(params => {
        this.userId = params.id;
      });
      this.promises.push(this.getUser(this.userId));
    }

    this.promises.push(this.getAllSectors());

    Promise.all(this.promises)
      .then(response => console.log('response', response))
      .catch(err => console.error(JSON.parse(`{'error': ${err}}`)));

    // Change the validators depending on the role
    this.checkValidators();
  }

  /*
  * Creates an user
  */
  save() {
    if (this.userForm.valid) {
      this.UserService
        .save(this.userForm.value)
        .then(response => {
          if (response.code === 'CREATED') {
            // redirect to /users and show a notification
            this.router.navigateByUrl('/users');
            this.NotifyService.show(`Usuarios agregado correctamente`, this.notificationSuccess);
          } else {
            this.NotifyService.show(`ERROR (${response.code}) - ${response.statusText}`, this.notificationError);
          }
        })
        .catch(err => console.error(JSON.parse(`{'error': ${err}}`)));
    } else {
      this.NotifyService.show('ERROR. Porfavor corrigue los datos e intentalo de nuevo!.', this.notificationError);
    }
  }

  /*
  * update an user
  */
  update() {
    this.UserService
      .update(this.userId, this.userForm.value)
      .then(response => {
        if (response.code === 'OK') {
          this.router.navigateByUrl('/users');
          this.NotifyService.show(`Usuarios actualizado correctamente`, this.notificationSuccess);
        } else {
          this.NotifyService.show(`ERROR (${response.code}) - ${response.statusText}`, this.notificationError);
        }
      })
      .catch(err => console.log(JSON.parse(`{'error': ${err}}`)));
  }

  /*
  * Get all the sectors from the API
  */
  getAllSectors() {
    return this.SectorService
      .findAll()
      .then(response => (this.sectors = response.data))
      .catch(err => console.error('error', err));
  }

  /*
  * check if the user to be add is regular
  */
  isRegularUser() {
    return this.userForm.value.role === 'regular';
  }

  /*
  * check if the user to be add is admin
  */
  isAdmin() {
    return this.userForm.value.role === 'admin';
  }

  /*
  * Get user by the given uuid and set it to the form object
  * @param{string} uuid
  */
  getUser(uuid) {
    return this.UserService
      .findOne(uuid)
      .then(response => this.userForm.reset(response.data))
      .catch(err => console.error(JSON.parse(`{'error': ${err}}`)));
  }

  /*
  * Apply different validators depending on the user role
  */
  checkValidators() {
    this.userForm.get('role').valueChanges.subscribe((role: string) => {
      if (this.editMode) {
        this.userForm.get('password').setValidators(null);
      }
      if (role === 'admin') {
        this.userForm.get('RFC').setValidators(null);
        this.userForm.get('sector').setValidators(null);
        this.userForm.get('address').setValidators(null);
      } else if (role === 'company') {
        this.userForm.get('RFC').setValidators([Validators.required]);
        this.userForm.get('sector').setValidators([Validators.required]);
        this.userForm.get('address').setValidators([Validators.required]);
      } else {
        this.userForm.get('RFC').setValidators(null);
        this.userForm.get('sector').setValidators([Validators.required]);
        this.userForm.get('address').setValidators([Validators.required]);
      }
      this.userForm.get('RFC').updateValueAndValidity();
    });
  }

  /*
  * Set the default password for the user that is going to be created.
  * NOTE: This method should be removed for regular user. In that case, the user
  * should recieve an email and set his password.
  * @param{Boolean} goDefault
  */
  setDefaultPassword(goDefault: boolean) {
    if (goDefault) {
      this.userForm.controls['password'].setValue(this.DEFAULT_PASSWORD);
      this.userForm.controls['password'].disable();
    } else {
      this.userForm.controls['password'].setValue(null);
      this.userForm.controls['password'].enable();
    }
  }

  /*
  * Check the limit of the rfc input to prevent limit.
  * @param{any} e
  */
  checkRFCLimit(e: any) {
    if ( e.target.value.length > 13 ) {
      e.preventDefault();
    }
  }

  /*
  * Show the clodinary uploader
  */
  showUploader() {
    cloudinary.openUploadWidget({ cloud_name: environment.cloudName, upload_preset: environment.uploadPreset},
    (error, photos)  => {
      if (!error) {
        this.photos.push(...photos.map( p => p.path));
        this.attachToUser();
      } else {
        if (error.message !== 'User closed widget') {
          this.NotifyService.show(`Error al subir la imagen`, this.notificationError);
          console.error('FormComponent@showUploader(): ', error);
        }
      }
    });
  }

  /*
  * Attach the images to the user
  */
  attachToUser() {
    const photosObj = this.photos.reduce((o, key: any) => ({ ...o, ['src']: key}), {});
    console.log('photosObj: ', photosObj);
    this.ImageService.save(photosObj)
      .then( response => {
        if (response.code === 'OK') {
          this.userForm.controls['assets'].setValue(response.data.uuid);
        } else {
          console.error('Error Storing asssets. FormComponent@attachToUser: ', response);
        }
      });
  }
}
