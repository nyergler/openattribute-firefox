#!/bin/sh

# Remove old *.xpi file
rm *.xpi

# Pack all extension files
zip -9 -r `basename \`pwd\``.xpi content locale module skin chrome.manifest install.rdf 
