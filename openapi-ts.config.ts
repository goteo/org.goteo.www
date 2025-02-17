import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://v4.goteo.org/v4/docs.json',
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
});
