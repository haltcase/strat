;(function (global) {
  'use strict'

  const ERR_ARGS_ARRAY = 'replacements argument must be an array, not a parameter list'
  const ERR_NUMBERING_MIX = 'cannot mix implicit & explicit formatting'

  let defaultTo = (x, y) => y == null ? x : y

  function create (transformers) {
    return function reformat (template, replacements) {
      if (replacements != null) {
        if (!Array.isArray(replacements)) {
          if (arguments.length > 2) {
            throw new TypeError(ERR_ARGS_ARRAY)
          }

          // single argument provided, cast as array
          replacements = [replacements]
        }
      } else {
        // return a curried function
        let curried = reformat.bind(null, template)
        Object.defineProperty(curried, 'raw', {
          configurable: false,
          enumerable: true,
          get: () => template
        })
        return curried
      }

      let idx = 0
      let state = 'UNDEFINED'

      return template.replace(
        /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
        function (match, literal, key, xf) {
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
          } else if ({}.hasOwnProperty.call(transformers, xf)) {
            return transformers[xf](value)
          } else {
            throw new Error(`no transformer named '${xf}'`)
          }
        }
      )
    }
  }

  function lookup (obj, path) {
    if (!/^\d+$/.test(path[0])) {
      path = ['0'].concat(path)
    }

    for (let idx = 0; idx < path.length; idx += 1) {
      let key = path[idx]
      let keyArray = key.split(' ')
      let fn = keyArray[0]
      let args = keyArray.slice(1)
      obj = typeof obj[fn] === 'function'
        ? obj[fn].apply(obj, args)
        : obj[key]
    }

    return obj
  }

  let format = create({})

  format.create = create

  format.extend = function (prototype, transformers) {
    let $format = create(transformers)
    prototype.format = function (replacements) {
      return $format.apply(global, [this, replacements])
    }
  }

  format.errors = {
    ERR_ARGS_ARRAY,
    ERR_NUMBERING_MIX
  }

  if (typeof module !== 'undefined') {
    module.exports = format
  } else if (typeof define === 'function' && define.amd) {
    define(() => format)
  } else {
    global.format = format
  }
}.call(this, this))
