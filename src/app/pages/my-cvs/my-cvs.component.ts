import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CvStorageService } from '../../services/cv-storage.service';
import { CvDocument } from '../../models/cv.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-cvs',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './my-cvs.component.html',
  styleUrl: './my-cvs.component.css',
})
export class MyCvsComponent implements OnInit {
  private readonly storage = inject(CvStorageService);

  readonly documents = signal<CvDocument[]>([]);
  readonly error = signal('');
  readonly message = signal('');

  ngOnInit(): void {
    this.load();
  }

  duplicate(id: string): void {
    this.perform(() => this.storage.duplicate(id));
  }

  rename(document: CvDocument): void {
    const name = window.prompt(
      'Nombre del currículum',
      document.name,
    );

    if (name === null) return;

    this.perform(() => this.storage.rename(document.id, name));
  }

  remove(document: CvDocument): void {
    const accepted = window.confirm(
      `¿Eliminar "${document.name}"? Esta acción no se puede deshacer.`,
    );

    if (!accepted) return;

    this.perform(() => this.storage.remove(document.id));
  }

  exportBackup(): void {
    this.error.set('');
    this.message.set('');

    try {
      const content = this.storage.exportBackup();

      const blob = new Blob([content], {
        type: 'application/json;charset=utf-8',
      });

      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');

      link.href = url;
      link.download = `cv-studio-respaldo-${new Date().toISOString().slice(0, 10)}.json`;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      this.message.set('Se ha iniciado la descarga del respaldo.');
    } catch {
      this.error.set('No se pudo exportar el respaldo.');
    }
  }

  async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.error.set('');
    this.message.set('');

    try {
      const count = this.storage.importBackup(await file.text());

      this.load();

      this.message.set(
        count === 1
          ? 'Se importó un CV. Los documentos anteriores se conservaron.'
          : `Se importaron ${count} CV. Los documentos anteriores se conservaron.`,
      );
    } catch (error: unknown) {
      console.error('Error al importar el respaldo:', error);

      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo importar el respaldo.',
      );
    } finally {
      input.value = '';
    }
  }

  previewColor(document: CvDocument): string {
    const colors = {
      blue: '#0854d5',
      teal: '#0f766e',
      purple: '#7e22ce',
      slate: '#334155',
    };

    return colors[document.design?.color ?? 'blue'];
  }

  private load(): void {
    try {
      this.documents.set(
        this.storage.list().sort(
          (a, b) => b.updatedAt.localeCompare(a.updatedAt),
        ),
      );

      this.error.set('');

    } catch {
      this.error.set('No se pudieron cargar los CV. Los datos almacenados se conservan.',);
    }
  }
  
  private perform(action: () => void): void {
    try {
      action();
      this.load();
    } catch {
      this.error.set('No se pudo completar la acción. Comprueba el almacenamiento del navegador.',);
    }
  }
}
