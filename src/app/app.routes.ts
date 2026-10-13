import { Routes } from '@angular/router';
import { MyCvsComponent } from './pages/my-cvs/my-cvs.component'
import { TemplateSelectorComponent } from './pages/template-selector/template-selector.component';
import { CvEditorComponent } from './pages/cv-editor/cv-editor.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: MyCvsComponent,
        title: 'Mis CV | CV Studio',
    },
    {
        path: 'plantillas',
        component: TemplateSelectorComponent,
        title: 'Elige tu plantilla | CV Studio',
    },
    {
        path: 'editor',
        component: CvEditorComponent,
        title: 'Editor | CV Studio',
    },
    {
        path: '**',
        redirectTo: '',
    },
];
