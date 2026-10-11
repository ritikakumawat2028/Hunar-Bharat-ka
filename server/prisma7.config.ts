import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: 'prisma/schema.prisma',
  },
  database: {
    provider: 'sqlite',
    url: 'file:./dev.db',
  },
});
