import { Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';
@Component({ selector: 'app-dashboard-welcome', imports: [IconComponent], templateUrl: './dashboard-welcome.component.html', styleUrl: './dashboard-welcome.component.scss' })
export class DashboardWelcomeComponent {
  readonly nombre = input.required<string>();
  readonly permitido = input(true);
  readonly crear = output<void>();
}
