import { defineArrayMember, defineField, defineType } from 'sanity'

export const landingPage = defineType({
  name: 'landingPage',
  title: 'LP設定',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero(トップビュー)',
      type: 'object',
      fields: [
        defineField({
          name: 'badge',
          title: 'バッジ文言',
          type: 'string',
          description: '見出し上部のピル型バッジに表示するテキスト',
        }),
        defineField({
          name: 'headline',
          title: 'キャッチコピー',
          type: 'text',
          rows: 3,
          description: '改行がそのまま表示に反映されます',
        }),
      ],
    }),
    defineField({
      name: 'galleryItems',
      title: 'タレントギャラリー画像',
      type: 'array',
      description: '設定するとAPI取得の代わりにこちらの画像がギャラリーに表示されます',
      of: [
        defineArrayMember({
          name: 'galleryItem',
          title: 'ギャラリー項目',
          type: 'object',
          fields: [
            defineField({
              name: 'photo',
              title: '写真',
              type: 'imageWithAlt',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'name',
              title: '名前',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'followers',
              title: 'フォロワー表記',
              type: 'string',
              description: '例: 12万フォロワー',
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'followers', media: 'photo' },
          },
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'meta title',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'meta description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'ogImage',
          title: 'OG画像',
          type: 'imageWithAlt',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'LP設定',
        subtitle: 'Hero・ギャラリー画像・SEOを管理',
      }
    },
  },
})
