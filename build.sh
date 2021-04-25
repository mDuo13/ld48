#!/bin/bash
OUTDIR=/another/site/ld48
for f in `ls *.json`; do
  jinjafy.py -i level.html.jinja2 -o $OUTDIR/${f%.json}.html -j $f
done
for f in `ls tile`; do
  convert tile/$f -scale 48x48 $OUTDIR/$f
done
for f in `ls map`; do
  #convert map/$f -scale 200%x200% $OUTDIR/$f
  cp map/$f $OUTDIR/$f
done
convert catprofile.png -scale 200%x200% $OUTDIR/catprofile.png
sassc ld48.scss $OUTDIR/ld48.css
cp ld48.js $OUTDIR
