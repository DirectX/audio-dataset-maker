import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AudioMarkupComponent } from './pages/audio-markup/audio-markup.component';

const routes: Routes = [
  {
    path: '',
    component: AudioMarkupComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
