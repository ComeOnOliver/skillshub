# Conan Package Manager

## conanfile.txt
```ini
[requires]
fmt/10.2.1
spdlog/1.13.0
nlohmann_json/3.11.3
[generators]
CMakeDeps
CMakeToolchain
```

## Build
```bash
conan install . --output-folder=build --build=missing
cmake -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
cmake --build build
```

## Search: conan search "fmt" -r conancenter
## Create: conan new cmake_lib && conan create .