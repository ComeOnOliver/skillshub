# CMake Testing

## Google Test
```cmake
FetchContent_Declare(googletest GIT_REPOSITORY https://github.com/google/googletest.git GIT_TAG v1.14.0)
FetchContent_MakeAvailable(googletest)
enable_testing()
add_executable(tests test/test_main.cpp)
target_link_libraries(tests PRIVATE mylib GTest::gtest_main)
gtest_discover_tests(tests)
```

```cpp
TEST(MathTest, Add) { EXPECT_EQ(add(2, 3), 5); }
TEST(MathTest, Throws) { EXPECT_THROW(divide(1, 0), std::runtime_error); }
```

## Run: ctest --test-dir build --output-on-failure -j$(nproc)
