/* global define */

;(function (global) {
  'use strict'

  const REGEX = /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g
  const hasOwn = Object.prototype.hasOwnProperty

  const ERR_ARGS_ARRAY = 'replacements argument must be an array, not a parameter list'
  const ERR_NUMBERING_MIX = 'cannot mix implicit & explicit formatting'

  const defaultTo = (x, y) => y == null ? x : y

  function create (transformers) {
    return function reformat (template, replacements) {
      if (replacements == null) {
        const partial = r => reformat(template, r)
        return Object.defineProperty(partial, 'raw', {
          configurable: false,
          enumerable: true,
          get: () => template
        })
      }

      if (!Array.isArray(replacements)) {
        if (arguments.length > 2) {
          throw new TypeError(ERR_ARGS_ARRAY)
        }

        // single argument provided, cast as array
        replacements = [replacements]
      }

      let idx = 0
      let state = 'UNDEFINED'

      return template.replace(REGEX, (match, literal, key, xf) => {
        if (literal != null) return literal

        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw new Error(ERR_NUMBERING_MIX)
          }

          state = 'EXPLICIT'
        } else {
          if (state === 'EXPLICIT') {
            throw new Error(ERR_NUMBERING_MIX)
          }

          state = 'IMPLICIT'
          key = String(idx)
          idx += 1
        }

        let value = defaultTo('', lookup(replacements, key.split('.')))

        if (xf == null) {
          return value
        } else if (hasOwn.call(transformers, xf)) {
          return transformers[xf](value, key, replacements)
        } else {
          throw new Error(`no transformer named '${xf}'`)
        }
      })
    }
  }

  function lookup (obj, path) {
    if (!/^\d+$/.test(path[0])) {
      path = ['0'].concat(path)
    }

    for (let idx = 0; idx < path.length; idx += 1) {
      const key = path[idx]
      const keyArray = key.split(' ')
      const fn = keyArray[0]
      obj = typeof obj[fn] === 'function'
        ? obj[fn].apply(obj, parseMethodArgs(keyArray))
        : obj[key]
    }

    return obj
  }

  function parseMethodArgs (keyArray) {
    return keyArray
      .slice(1)
      .join(' ')
      .split(/,\s*/g)
      .map(v => {
        if (v === '_') return null
        if (v === '__') return '_'
        return v
      })
  }

  const strat = create({})

  strat.create = create

  strat.extend = function (prototype, transformers) {
    const $format = create(transformers)
    prototype.format = function (replacements) {
      return $format.apply(global, [this, replacements])
    }
  }

  strat.errors = {
    ERR_ARGS_ARRAY,
    ERR_NUMBERING_MIX
  }

  if (typeof module !== 'undefined') {
    module.exports = strat
  } else if (typeof define === 'function' && define.amd) {
    define(() => strat)
  } else {
    global.strat = strat
  }
}.call(this, this))
