rm -rf dist
mkdir -p dist
cp -R public dist/public

#npx @redocly/cli bundle internal@latest -o bundled.yaml
#npx @redocly/cli build-docs bundled.yaml
#mv redoc-static.html api-docs-internal.html

#npx @redocly/cli bundle public@latest -o bundled.yaml
#npx @redocly/cli build-docs bundled.yaml
#mv redoc-static.html dist/public/docs.html

npx tsc --build --force --verbose

echo build done
