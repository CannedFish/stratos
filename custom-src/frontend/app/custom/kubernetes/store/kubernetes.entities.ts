// TODO: RC DELETE ME
// import { getAPIResourceGuid } from '../../../../../store/src/selectors/api.selectors';
// import { ExtensionEntitySchema } from '../../../core/extension/extension-types';
// import { getKubeAPIResourceGuid } from './kube.selectors';
// import { KubernetesApp } from './kube.types';

// export const kubernetesSchemaKey = 'kubernetesInfo';
// export const kubernetesNodesSchemaKey = 'kubernetesNode';
// export const kubernetesPodsSchemaKey = 'kubernetesPod';
// export const kubernetesNamespacesSchemaKey = 'kubernetesNamespace';
// export const kubernetesServicesSchemaKey = 'kubernetesService';
// export const kubernetesStatefulSetsSchemaKey = 'kubernetesStatefulSet';
// export const kubernetesDeploymentsSchemaKey = 'kubernetesDeployment';
// export const kubernetesAppsSchemaKey = 'kubernetesApp';
// export const kubernetesDashboardSchemaKey = 'kubernetesDashboard';

// export const getKubeAppId = (object: KubernetesApp) => object.name;

// export const kubernetesEntities: ExtensionEntitySchema[] = [
//   {
//     entityKey: kubernetesSchemaKey,
//     definition: {},
//     options: { idAttribute: getAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesAppsSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAppId }
//   },
//   {
//     entityKey: kubernetesStatefulSetsSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesPodsSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesDeploymentsSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesNodesSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesNamespacesSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesServicesSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   },
//   {
//     entityKey: kubernetesDashboardSchemaKey,
//     definition: {},
//     options: { idAttribute: getKubeAPIResourceGuid }
//   }
// ];

// export const kubernetesEntityKeys: string[] = [
//   kubernetesSchemaKey,
//   kubernetesAppsSchemaKey,
//   kubernetesStatefulSetsSchemaKey,
//   kubernetesPodsSchemaKey,
//   kubernetesDeploymentsSchemaKey,
//   kubernetesNodesSchemaKey,
//   kubernetesNamespacesSchemaKey,
//   kubernetesServicesSchemaKey,
//   kubernetesDashboardSchemaKey,
// ];
