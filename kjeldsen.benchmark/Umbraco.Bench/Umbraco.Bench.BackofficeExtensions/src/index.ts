import type { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';

// Single entry point for all backoffice extensions in this project.
// Register manifests here (sections, dashboards, property editors, workspace views, ...):
//
//   extensionRegistry.register({
//       type: 'dashboard',
//       alias: 'Umbraco.Bench.Dashboard',
//       name: 'Umbraco.Bench Dashboard',
//       element: () => import('./dashboards/my-dashboard.ts'),
//       meta: { label: 'Umbraco.Bench', pathname: 'umbracobench' },
//   });

export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {
    console.log('[Umbraco.Bench] backoffice extensions registered');
};
