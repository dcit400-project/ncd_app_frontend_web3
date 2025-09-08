rem start cmd /k "ionic start offline-ncd blank --type=angular --offline & cd offline-ncd""
rem start cmd /k "ionic start temp-project blank --type=angular --no-deps"

set TEMPLATE_DIR=%CD%\ionic_templates\tabs_gitted

start cmd /k "pnpm install ionic --offline & pnpm install --strict-peer-dependencies --offline"

rem Copy new-project's json to global and re-install global