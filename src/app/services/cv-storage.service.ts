import { Injectable } from '@angular/core';
import {
  CvData,
  CvDocument,
  CvTemplate,
} from '../models/cv.model';

@Injectable({ providedIn: 'root' })
export class CvStorageService {
  private readonly key = 'cv-studio-documents-v1';
  private readonly draftKey = 'cv-studio-draft-v1';

  list(): CvDocument[] {
    const stored = localStorage.getItem(this.key);

    if (stored !== null) {
      const documents = JSON.parse(stored);

      if (
        !Array.isArray(documents) ||
        !documents.every((document) => this.isDocument(document))
      ) {
        throw new Error('El almacenamiento de CV no es válido.');
      }

      return documents.map((document: CvDocument) => ({
        ...document,
        data: this.normalizeData(document.data),
      }));
    }

    const oldDraft = localStorage.getItem(this.draftKey);

    if (oldDraft === null) return [];

    const draft = JSON.parse(oldDraft);

    if (draft?.version !== 1 || !this.isData(draft.data)) {
      throw new Error('No se pudo recuperar el borrador anterior.');
    }

    const document: CvDocument = {
      id: crypto.randomUUID(),
      name: 'Mi primer CV',
      template: draft.template === 'modern' ? 'modern' : 'classic',
      updatedAt: new Date().toISOString(),
      data: this.normalizeData(draft.data),
    };

    this.write([document]);

    return [document];
  }

  get(id: string): CvDocument | undefined {
    return this.list().find((document) => document.id === id);
  }

  create(template: CvTemplate): CvDocument {
    const document: CvDocument = {
      id: crypto.randomUUID(),
      name: 'Nuevo CV',
      template,
      updatedAt: new Date().toISOString(),
      data: {
        name: '',
        title: '',
        email: '',
        phone: '',
        city: '',
        profile: '',
        experiences: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
        links: [],
      },
    };

    const documents = this.list();
    this.write([document, ...documents]);

    return document;
  }

  save(document: CvDocument): void {
    const documents = this.list();
    const index = documents.findIndex(
      (item) => item.id === document.id,
    );

    if (index === -1) {
      throw new Error('El CV ya no existe.');
    }

    documents[index] = {
      ...document,
      updatedAt: new Date().toISOString(),
    };

    this.write(documents);
  }

  duplicate(id: string): void {
    const documents = this.list();
    const original = documents.find((item) => item.id === id);

    if (!original) throw new Error('No se encontró el CV.');

    const copy: CvDocument = {
      ...structuredClone(original),
      id: crypto.randomUUID(),
      name: `${original.name} (copia)`,
      updatedAt: new Date().toISOString(),
    };

    this.write([copy, ...documents]);
  }

  rename(id: string, name: string): void {
    const document = this.get(id);

    if (!document) throw new Error('No se encontró el CV.');
    if (!name.trim()) throw new Error('Escribe un nombre para el CV.');

    this.save({ ...document, name: name.trim() });
  }

  remove(id: string): void {
    this.write(this.list().filter((item) => item.id !== id));
  }

  exportBackup(): string {
    return JSON.stringify(
      {
        app: 'cv-studio',
        version: 1,
        exportedAt: new Date().toISOString(),
        documents: this.list(),
      },
      null,
      2,
    );
  }

  importBackup(content: string): number {
    const backup = JSON.parse(content);

    if (
      backup?.app !== 'cv-studio' ||
      backup.version !== 1 ||
      !Array.isArray(backup.documents) ||
      !backup.documents.every(
        (document: unknown) => this.isDocument(document),
      )
    ) {
      throw new Error('El archivo no es un respaldo válido de CV Studio.');
    }

    const existing = this.list();

    const imported: CvDocument[] = backup.documents.map(
      (document: CvDocument) => ({
        ...structuredClone(document),
        id: crypto.randomUUID(),
        name: `${document.name} (importado)`,
        updatedAt: new Date().toISOString(),
        data: this.normalizeData(document.data),
      }),
    );

    this.write([...imported, ...existing]);

    return imported.length;
  }

  private write(documents: CvDocument[]): void {
    localStorage.setItem(this.key, JSON.stringify(documents));
  }

  private isDocument(value: any): value is CvDocument {
    return (
      value &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      typeof value.updatedAt === 'string' &&
      (value.template === 'classic' || value.template === 'modern') &&
        (
          value.design === undefined ||
            (
              value.design &&
              ['blue', 'teal', 'purple', 'slate'].includes(value.design.color) &&
              ['sans', 'serif', 'mono'].includes(value.design.font)
              && (
                value.design.hiddenSections === undefined ||
                (
                  Array.isArray(value.design.hiddenSections) &&
                  value.design.hiddenSections.every(
                    (section: unknown) =>
                      typeof section === 'string' &&
                      [
                        'profile',
                        'experiences',
                        'education',
                        'projects',
                        'skills',
                        'languages',
                        'certifications',
                        'links',
                      ].includes(section),
                  )
                )
              )
            )
        ) &&

      this.isData(value.data)
    );
  }

  private isData(value: any): value is CvData {
    if (!value || typeof value !== 'object') return false;

    const textFields = [
      'name', 'title', 'email', 'phone', 'city', 'profile',
    ];

    if (
      !textFields.every(
        (field) => typeof value[field] === 'string',
      )
    ) {
      return false;
    }

    const lists = [
      {
        key: 'experiences',
        fields: [
          'id', 'position', 'company', 'startDate',
          'endDate', 'description',
        ],
        flag: 'current',
      },
      {
        key: 'education',
        fields: [
          'id', 'degree', 'institution', 'startDate',
          'endDate', 'description',
        ],
        flag: 'ongoing',
      },
      { key: 'skills', fields: ['id', 'name'], flag: '' },
      {
        key: 'languages',
        fields: ['id', 'name', 'level'],
        flag: '',
      },
      {
        key: 'certifications',
        fields: ['id', 'name', 'issuer', 'date'],
        flag: '',
      },
    ];

    if (
      value.projects !== undefined &&
      (
        !Array.isArray(value.projects) ||
        !value.projects.every(
          (item: any) =>
            item &&
            ['id', 'name', 'description', 'technologies', 'url'].every(
              (field) => typeof item[field] === 'string',
            ),
        )
      )
    ) {
      return false;
    }

    if (
      value.links !== undefined &&
      (
        !Array.isArray(value.links) ||
        !value.links.every(
          (item: any) =>
            item &&
            ['id', 'label', 'url'].every(
              (field) => typeof item[field] === 'string',
            ),
        )
      )
    ) {
      return false;
    }

    return lists.every(
      (list) =>
        Array.isArray(value[list.key]) &&
        value[list.key].every(
          (item: any) =>
            item &&
            list.fields.every(
              (field) => typeof item[field] === 'string',
            ) &&
            (!list.flag || typeof item[list.flag] === 'boolean'),
        ),
    );
  }

  private normalizeData(data: CvData): CvData {
    return {
      ...data,
      projects: data.projects ?? [],
      links: data.links ?? [],
    };
  }
}