@echo off
echo Starting WordCard backend (Spring Boot)...
pushd back
if exist pom.xml (
  start "WordCard Backend" cmd /k "mvn spring-boot:run"
) else (
  echo pom.xml not found in back directory.
  exit /b 1
)
popd
echo Backend started. Please start the frontend via WeChat DevTools manually.
