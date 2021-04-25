# Vibin' Secrets
A game of dowsing and hidden objects for [Ludum Dare 48](https://ldjam.com/events/ludum-dare/48).

> You've found a mysterious pair of dowsing rods in the attic and decided to go take them for a spin nearby to see if they do anything.

Requires a modern browser (i.e. not Internet Explorer). Not optimized for mobile, but maybe playable.

**Try it here: <https://mduo13.com/ld48/>**

Full credits and stuff on the title page.

## Build instructions

[`./build.sh`](./build.sh) is intended to run on Linux. Install [Jinja](https://jinja.palletsprojects.com/) (for Python 3), [ImageMagick](https://imagemagick.org/), and [sassc](https://github.com/sass/sassc) first. This creates an `out/` folder with everything. You can then open `out/index.html` in a browser, either directly from the filesystem or by uploading to a web server.
