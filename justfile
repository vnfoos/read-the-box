dev:
    npx chokidar "src/**/*" -c "gleam build && vite build"

build:
    gleam build && vite build