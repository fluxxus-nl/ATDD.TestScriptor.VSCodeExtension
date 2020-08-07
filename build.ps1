$targetPlatformWin = "win-x64"
$buildConfiguration = "Release"

cd "./services/ATDD.TestScriptor.BackendServices"
dotnet publish --configuration $buildConfiguration --output ../../vscode-extension/bin/windows --self-contained -r $targetPlatformWin /p:PublishSingleFile=true /p:PublishTrimmed=true
cd "./../../web-ui"
yarn build
cd "./../vscode-extension"
((Get-Content -path ./package.json -Raw) -replace '"debugMode": true','"debugMode": false') | Set-Content -Path ./package.json
vsce package