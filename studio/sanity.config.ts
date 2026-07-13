import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'sirucloud-lp',
  title: 'シルクラウド LP CMS',

  projectId: 'cqjhux75',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('root')
          .title('コンテンツ管理')
          .items([
            S.listItem()
              .id('landingPage')
              .title('LP設定')
              .icon(() => '🖥️')
              .child(S.editor().id('landingPage').schemaType('landingPage').documentId('landingPage')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
