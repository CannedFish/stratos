import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const kubernetes: Routes = [
  {
    path: 'kubernetes',
    loadChildren: './kubernetes/kubernetes.module#KubernetesModule',
    data: {
      stratosNavigation: {
        text: 'Kubernetes',
        matIcon: 'kubernetes',
        matIconFont: 'stratos-icons',
        position: 60,
        requiresEndpointType: 'k8s'
      }
    }
  },
  // TODO: RC helm
  // {
  //   path: 'monocular',
  //   loadChildren: './helm/helm.module#HelmModule',
  //   data: {
  //     stratosNavigation: {
  //       text: 'Helm',
  //       matIcon: 'helm',
  //       matIconFont: 'stratos-icons',
  //       position: 65,
  //       requiresEndpointType: 'helm'
  //     }
  //   }
  // }
];

@NgModule({
  imports: [
    RouterModule.forRoot(kubernetes),
  ],
  declarations: []
})
export class CustomRoutingModule { }
