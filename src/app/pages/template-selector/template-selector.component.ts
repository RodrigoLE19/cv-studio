import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type CvTemplate = 'classic' | 'modern';

@Component({
  selector: 'app-template-selector',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './template-selector.component.html',
  styleUrl: './template-selector.component.css',
})
export class TemplateSelectorComponent {
  readonly selectedTemplate = signal<CvTemplate>('classic');

  selectTemplate(template: CvTemplate): void {
    this.selectedTemplate.set(template);
  }
}
