#########################################################################
# Parse polygonal paths out of an SVG.                                  #
# Run Flatten Beziers extension in inkscape, and save as text.svg,      #
# file type plain SVG.                                                  #
# Ungroup all objects to prevent inkscape using transforms              #
#########################################################################

import re
import json

from svg.path import parse_path;
from svg.path.path import Line, Move;

with open("text.svg", "r") as textfile:
    data = textfile.read()
    paths = re.findall(r"[\s]d=\"(.+)\"", data)

    lines = "&[\n"

    for path_string in paths:
        path = parse_path(path_string)
        for segment in path:
            if isinstance(segment, Line):
                lines += "Line{from: Vec2d{ x: " + str(segment.start.real) + ", y: " + str(segment.start.imag) + "}, to: Vec2d{ x: " + str(segment.end.real) + ", y: " + str(segment.end.imag) + " }},\n"
            elif not isinstance(segment, Move):
                print(f"Invalid segment type {type(segment)}")

    lines += "]"

    with open("../src/text.rs", "w") as outfile:
        s = "use Line;\nuse Vec2d;\npub static TEXT_RAW: &[Line] = " + lines + ";\n"
        outfile.write(s)
