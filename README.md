# Jademixinify - Jade mixins as template functions. Yaywoo!

Based on [Jadeify](https://github.com/domenic/jadeify). The only reason it's not
a pull request is that its about as dirty as hacks can be.

**Jademixinify** lets you use [Jade][] mixins as template functions with [browserify][] in the simplest way possible.

*This is a 0.0.1 release. It has no tests. You should not use this.*
Ideally this will never reach 1.0 as it will become available in either Jadeify
or Jade core.

## Why?

We have a large library component library of composable mixins which we really like.
I wanted to use these on the front end without having to copy compiled HTML and string
mash it in my front end code. Jade doesnt expose mixins that are present in a file
unless they are *called* in which case it exposes the rendered result. I'm abusing
the `dynamicMixins` concept to expose them then hacking it into a series of functions
that are usable.

Hopefully with 2.0 around the corner it will be easier to do this without all this dirtiness.

## Usage?

template.jade:
```jade
mixin the-thing(title, link)
  a.title(href=link)= title
```

app.js:
```js
var templates = require("./template.jade");

document.getElementById("my-thing").innerHTML = templates['the-thing']('The title', 'http://example.com/');
```

## Setup

The rest of the docs are the same as [Jadeify](https://github.com/domenic/jadeify) - go read them over there.
