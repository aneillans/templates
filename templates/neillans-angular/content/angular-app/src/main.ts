// Bootstrap's dropdown behaviour (data-bs-toggle="dropdown"). Import other plugins the same way.
import 'bootstrap/js/src/dropdown.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => console.error(error));
