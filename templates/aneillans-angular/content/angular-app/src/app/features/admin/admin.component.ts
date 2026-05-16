import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `
    <section class="card">
      <h2>Admin</h2>
      <p>Protect this route in your app if token has the admin role.</p>
    </section>
  `,
})
export class AdminComponent {}
