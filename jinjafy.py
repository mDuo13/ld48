#!/usr/bin/env python3
# -*- coding: utf-8 -*-
## General purpose commandline script for Jinja templates
## © 2021 Rome Reginelli (mDuo13)
## This file ONLY is subject to the 3-clause BSD license:
## https://opensource.org/licenses/BSD-3-Clause

import argparse
import sys
import jinja2
import json
from contextlib import redirect_stdout

STDIN = "stdin"
STDOUT = "stdout"

def main(infile, outfile, jsonfile=None):
    if infile == STDIN:
        ts = sys.stdin.read()
    else:
        with open(infile, "r") as f:
            ts = f.read()

    t = jinja2.Template(ts)

    if jsonfile:
        with open(jsonfile, "r") as f:
            js = json.load(f)
        s = t.render(**js)
    else:
        s = t.render()

    if outfile == STDOUT:
        print(s)
    else:
        with open(outfile, "w") as f:
            f.write(s)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description='Parse Jinja template')
    p.add_argument('-i', type=str, default=STDIN, help='Jinja template to take as input')
    p.add_argument('-o', type=str, default=STDOUT, help='Where to write output')
    p.add_argument('-j', type=str, help='JSON file with variables to use in the script')
    a = p.parse_args()

    main(a.i, a.o, a.j)
