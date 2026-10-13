import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { 
  CvData, 
  Education, 
  Experience,
  Skill,
  Language,
  Certification,
  CvProject,
  ProfessionalLink,
  CvDesign,
  CvSection
 } from '../../models/cv.model';
 import { NgTemplateOutlet } from '@angular/common';
import { HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CvStorageService } from '../../services/cv-storage.service';
import { CvDocument } from '../../models/cv.model';


@Component({
  selector: 'app-cv-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './cv-editor.component.html',
  styleUrl: './cv-editor.component.css',
})
export class CvEditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  private readonly storage = inject(CvStorageService);
  private readonly router = inject(Router);

  document?: CvDocument;
  private saveTimer?: ReturnType<typeof setTimeout>;
  private canSave = true;

  saveStatus = 'Sin cambios pendientes';

  design: CvDesign = {
    color: 'blue',
    font: 'sans',
  };

  readonly palettes = {
    blue: { accent: '#0854d5', soft: '#eff6ff' },
    teal: { accent: '#0f766e', soft: '#f0fdfa' },
    purple: { accent: '#7e22ce', soft: '#faf5ff' },
    slate: { accent: '#334155', soft: '#f1f5f9' },
  }

  readonly fonts = {
    sans: 'Arial, Helvetica, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"Courier New", Courier, monospace',
  };

  get accentColor(): string {
    return this.palettes[this.design.color].accent;
  }

  get softColor(): string {
    return this.palettes[this.design.color].soft;
  }

  get documentFont(): string {
    return this.fonts[this.design.font];
  }

  readonly sectionOptions: { key: CvSection; label: string }[] = [
    { key: 'profile', label: 'Perfil profesional' },
    { key: 'experiences', label: 'Experiencia laboral' },
    { key: 'education', label: 'Educación' },
    { key: 'projects', label: 'Proyectos' },
    { key: 'skills', label: 'Habilidades' },
    { key: 'languages', label: 'Idiomas' },
    { key: 'certifications', label: 'Cursos y certificaciones' },
    { key: 'links', label: 'Enlaces profesionales' },
  ];

  isSectionVisible(section: CvSection): boolean {
    return !(this.design.hiddenSections ?? []).includes(section);
  }

  toggleSection(section: CvSection): void {
    const hidden = this.design.hiddenSections ?? [];

    this.design.hiddenSections = hidden.includes(section)
      ? hidden.filter((item) => item !== section)
      : [...hidden, section];

    this.scheduleSave();
  }

  ngOnInit(): void {
    this.canSave = false;

    try {
      const id = this.route.snapshot.queryParamMap.get('id');

      if (id) {
        const document = this.storage.get(id);

        if (!document) {
          this.saveStatus = 'No se encontró el CV solicitado.';
          return;
        }

        this.document = document;
      } else {
        const selected =
          this.route.snapshot.queryParamMap.get('plantilla');

        this.document = this.storage.create(
          selected === 'modern' ? 'modern' : 'classic',
        );

        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {id: this.document.id},
          replaceUrl: true,
        });
      }

      this.cv = this.document.data;
      this.design = {
        color: this.document.design?.color ?? 'blue',
        font: this.document.design?.font ?? 'sans',
        hiddenSections: [
          ...(this.document.design?.hiddenSections ?? []),
        ],
      };
      this.template = this.document.template;
      this.canSave = true;
      this.saveStatus = 'Guardado en este navegador';

    } catch {
      this.saveStatus =
        'No se pudo abrir el CV. Los datos almacenados se conservan.';
    }
  }

  scheduleSave(): void {
    if (!this.canSave) return;

    clearTimeout(this.saveTimer);
    this.saveStatus = 'Guardando...';

    this.saveTimer = setTimeout(() => {
      this.saveDraft();
    }, 300);
  }

  saveDraft(): void {
    if (!this.canSave || !this.document) return;

    clearTimeout(this.saveTimer);

    try {
      this.storage.save({
        ...this.document,
        data: this.cv,
        template: this.template === 'modern' ? 'modern' : 'classic',
        design: {...this.design},
      });

      this.saveStatus = 'Guardado en este navegador';
    } catch {
      this.saveStatus = 'No se pudo guardar el CV en este navegador.';
    }
  }

  changeTemplate(): void {
    this.template = this.template === 'classic' ? 'modern' : 'classic';

    this.saveDraft();
  }

  @HostListener('window:pagehide')
  onPageHide(): void {
    this.saveDraft();
  }

  ngOnDestroy(): void {
    this.saveDraft();
  }

  template =
    this.route.snapshot.queryParamMap.get('plantilla') === 'modern'
      ? 'modern'
      : 'classic';
  
  cv: CvData = {
        name: '',
        title: '',
        email: '',
        phone: '',
        city: '',
        profile: '',
        experiences: [],
        education: [],
        skills:  [],
        languages: [],
        certifications: [],
        projects: [],
        links: [],
      };

  get initials(): string {
    return this.cv.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'CV';

  }

  get visibleExperiences(): Experience[] {
    return this.cv.experiences.filter(
      (item) => item.position.trim() || item.company.trim(),
    );
  }

  get visibleEducation(): Education[] {
    return this.cv.education.filter(
      (item) => item.degree.trim() || item.institution.trim(),
    );
  }

  addExperience(): void {
    this.cv.experiences.push({
      id: crypto.randomUUID(),
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });

    this.scheduleSave();
  }

  removeExperience(id: string): void {
    this.cv.experiences = this.cv.experiences.filter(
      (item) => item.id !== id,
    );

    this.scheduleSave();
  }

  addEducation(): void {
    this.cv.education.push({
      id: crypto.randomUUID(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      ongoing: false,
      description: '',
    });

    this.scheduleSave();
  }

  removeEducation(id: string): void {
    this.cv.education = this.cv.education.filter(
      (item) => item.id !== id,
    );

    this.scheduleSave();
  }

  formatPeriod(start: string, end: string, current: boolean): string {
    return [
      this.formatMonth(start),
      current ? 'Actualidad' : this.formatMonth(end),
    ]
      .filter(Boolean)
      .join(' — ');
  }

  private formatMonth(value: string): string {
    if (!value) return '';

    const [year, month] = value.split('-').map(Number);

    if (!year || !month || month < 1 || month > 12) return '';

    return new Intl.DateTimeFormat('es-PE', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1));
  }

  get visibleSkills(): Skill[] {
    return this.cv.skills.filter((item) => item.name.trim());
  }

  get visibleLanguages(): Language[] {
    return this.cv.languages.filter((item) => item.name.trim());
  }

  get visibleCertifications(): Certification[] {
    return this.cv.certifications.filter((item) => item.name.trim());
  }

  addSkill(): void {
    this.cv.skills.push({
      id: crypto.randomUUID(),
      name: '',
    });

    this.scheduleSave();
  }

  removeSkill(id: string): void {
    this.cv.skills = this.cv.skills.filter((item) => item.id !== id);

    this.scheduleSave();
  }

  addLanguage(): void {
    this.cv.languages.push({
      id: crypto.randomUUID(),
      name: '',
      level: '',
    });

    this.scheduleSave();
  }
  
  removeLanguage(id: string): void {
    this.cv.languages = this.cv.languages.filter((item) => item.id !== id);

    this.scheduleSave();
  }

  addCertification(): void {
    this.cv.certifications.push({
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
    });

    this.scheduleSave();
  }
  
  removeCertification(id: string): void {
    this.cv.certifications = this.cv.certifications.filter((item) => item.id !== id,);

    this.scheduleSave();
  }

  formatCertificationDate(date: string): string {
    return this.formatMonth(date);
  }

  get visibleProjects(): CvProject[] {
    return this.cv.projects.filter((item) => item.name.trim());
  }

  get visibleLinks(): ProfessionalLink[] {
    return this.cv.links.filter(
      (item) => item.label.trim() && this.safeUrl(item.url),
    );
  }

  addProject(): void {
    this.cv.projects.push({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: '',
      url: '',
    });

    this.scheduleSave();
  }

  removeProject(id: string): void {
    this.cv.projects = this.cv.projects.filter((item) => item.id !== id,);

    this.scheduleSave();
  }

  addLink(): void {
    this.cv.links.push({
      id: crypto.randomUUID(),
      label: '',
      url: '',
    });

    this.scheduleSave();
  }

  removeLink(id: string): void {
    this.cv.links = this.cv.links.filter((item) => item.id !== id,);

    this.scheduleSave();
  }

  safeUrl(value: string): string | null {
    const text = value.trim();

    if (!text) return null;

    try {
      const url = new URL(text);

      return url.protocol === 'https:' || url.protocol === 'http:'
        ? url.href
        : null;
    } catch {
      return null;
    }
  }


  exportPdf(): void {
    this.saveDraft();
    window.print();
  }
}
