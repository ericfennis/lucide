#!/bin/bash

mkdir -p icons-test       # (modified) svg files
mkdir -p icons-test-font  # font files
mkdir -p icons-exported

# cp "icons/link.svg" "icons-test/link-r.svg"  # will be modified by svgo+inkscape+svgo
svgoconfig="module.exports={multipass:true,plugins:['convertPathData', {name:'convertShapeToPath',params:{convertArcs:true}}]}"
svgo --config <(echo "$svgoconfig") -f icons -o icons-test

# for icon in icons-test/*svg
# do
# icon_name="$(basename -- $icon)"
# echo "icon: $icon_name"

# done
/Applications/Inkscape.app/Contents/MacOS/inkscape -g --export-plain-svg --export-filename="icons-exported/home.svg icons-exported/airplay.svg" --batch-process --actions="select-all;object-stroke-to-path;path-union" "icons-test/home.svg icons-test/airplay.svg"


svgoconfig="module.exports={multipass:true,plugins:['convertPathData', {name:'convertShapeToPath',params:{convertArcs:true}}, {name:'removeAttrs',params:{attrs:['fill','stroke','stroke-width','style']}}]}"
# TODO: not sure if these removeAttrs work for every icon in the set?
# svgo --config <(echo "$svgoconfig")  -f icons -o icons-test


# docker run -v ${PWD}:/project drichner/fontcustom compile "/project/icons-test" -h -n "lucide-r" -o "/project/icons-test-font" -F
