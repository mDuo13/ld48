#!/bin/bash
OUTDIR=out
mkdir -p $OUTDIR
for f in `ls leveldata`; do
  jinjafy.py -i level.html.jinja2 -o $OUTDIR/${f%.json}.html -j leveldata/$f
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
cp index.html $OUTDIR
cp index.js $OUTDIR
cp cleocredit.jpg $OUTDIR
