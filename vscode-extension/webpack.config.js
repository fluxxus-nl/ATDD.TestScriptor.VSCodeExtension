// Source: https://github.com/microsoft/vscode-iot-workbench

const path = require("path");
const cp = require("child_process");
const fs = require("fs-plus");

function getDependeciesFromNpm(mod) {
  let list = [];
  const deps = mod.dependencies;
  if (!deps) {
    return list;
  }
  for (const m of Object.keys(deps)) {
    list.push(m);
    list = list.concat(getDependeciesFromNpm(deps[m]));
  }
  return list;
}

function getEntry() {
  const entry = {};
  const npmListRes = cp.execSync("npm list -only prod -json", {
    encoding: "utf8"
  });
  const mod = JSON.parse(npmListRes);
  const unbundledModule = [];
  for (const mod of unbundledModule) {
    switch (mod) {
      default:
        let p = "node_modules/" + mod;
        fs.copySync(p, "out/node_modules/" + mod);
        break;    
    }
  }

  // clipboardy is special
  let clipboardyFallbacks = "node_modules/clipboardy/fallbacks";
  fs.copySync(clipboardyFallbacks, "out/fallbacks");

  const list = getDependeciesFromNpm(mod);
  const moduleList = list.filter((value, index, self) => {
    return self.indexOf(value) === index && unbundledModule.indexOf(value) === -1 && !/^@types\//.test(value);
  });

  for (const mod of moduleList) {
    entry[mod] = "./node_modules/" + mod;
  }

  return entry;
}

/**@type {import('webpack').Configuration}*/
const config = {
  target: "node",

  entry: getEntry(),
  output: {
    path: path.resolve(__dirname, "out/node_modules"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  node: {
    __dirname: false,
    __filename: false,
    console: true,
    global: true,
    process: true    
  },
  externals: {
    vscode: "commonjs vscode"
  },
  resolve: {
    extensions: [".js", ".json"]
  }
};

module.exports = config;
