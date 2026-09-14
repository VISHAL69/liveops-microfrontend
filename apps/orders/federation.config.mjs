import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'orders',



  exposes: {
    './Component': './apps/orders/src/app/app.ts',
  },

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          // includeSecondaries is an opt-out of ignoreUnusedDeps, so all of
          // @angular/core is shared to prevent mismatches.
          '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package', includeSecondaries: { keepAll: true } },
          'primeng': {
          singleton: true,
          strictVersion: true,
          requiredVersion: '22.1.1',
          build: 'package',
          includeSecondaries: {
            resolveGlob: true,
            keepAll: true,
          },
        },
        '@primeuix/utils': {
          singleton: true,
          strictVersion: true,
          requiredVersion: '0.8.2',
          build: 'package',
          includeSecondaries: {
            resolveGlob: true,
          },
        },
        },
      },
    ),
    
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // ignoreUnusedDeps is enabled by default now
    // ignoreUnusedDeps: true,

    // Opt-in: groups chunks in remoteEntry.json for smaller metadata file
    denseChunking: true
  }
});
