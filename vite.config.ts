import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  // ...vite configures
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'lib',
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'viteNodeApp',
      // Optional, default: 'esbuild'
      // The TypeScript compiler you want to use
      // by default this plugin is using vite default ts compiler which is esbuild
      // 'swc' compiler is supported to use as well for frameworks
      // like Nestjs (esbuild dont support 'emitDecoratorMetadata' yet)
      // you need to INSTALL `@swc/core` as dev dependency if you want to use swc
      tsCompiler: 'esbuild',

      // Optional, default: {
      // jsc: {
      //   target: 'es2019',
      //   parser: {
      //     syntax: 'typescript',
      //     decorators: true
      //   },
      //  transform: {
      //     legacyDecorator: true,
      //     decoratorMetadata: true
      //   }
      // }
      // }
      // swc configs, see [swc doc](https://swc.rs/docs/configuration/swcrc)
      swcOptions: {
        jsc: {
          target: 'ESNext',
          moduleResolution: 'nodenext',
          baseUrl: './',
          composite: true,
          allowSyntheticDefaultImports: true,
          declarationMap: true,
          declaration: true,
          sourceMap: true,
          isolatedModules: true,
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          forceConsistentCasingInFileNames: true,
        },
      },
    }),
  ],
  optimizeDeps: {
    // Vite does not work well with optionnal dependencies,
    // you can mark them as ignored for now
    // eg: for nestjs, exlude these optional dependencies:
    // exclude: [
    //   '@nestjs/microservices',
    //   '@nestjs/websockets',
    //   'cache-manager',
    //   'class-transformer',
    //   'class-validator',
    //   'fastify-swagger',
    // ],
  },
})
