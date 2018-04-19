type Mixed = string | number | boolean | symbol | object

type Transformer = (value: string, key: string, collection: any[]) => string

type TransformerMap = {
  [key: string]: Transformer
}

interface FormatPartial <T extends string> {
  (replacements?: null | undefined): FormatPartial<T>
  (replacements: any): string
  raw: T
}

interface Format {
  <T extends string> (template: T, replacements?: null | undefined): FormatPartial<T>
  (template: string, replacements: any): string
}

interface Strat {
  <T extends string> (template: T): FormatPartial<T>

  <T extends string> (template: T, replacements?: null | undefined): FormatPartial<T>
  (template: string, replacements: any): string

  create (transformers?: TransformerMap): Format
  extend (
    prototype: object,
    transformers?: TransformerMap
  ): void

  errors: {
    ERR_ARGS_ARRAY: 'replacements argument must be an array, not a parameter list',
    ERR_NUMBERING_MIX: 'cannot mix implicit & explicit formatting'
  }
}

declare const strat: Strat

export = strat