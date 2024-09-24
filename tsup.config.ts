import { defineConfig } from 'tsup'

export default defineConfig({
  // entry: ['src/index.ts'],
  noExternal: [ /(.*)/ ],
  splitting: false,
  sourcemap: false,
  clean: true,
})
