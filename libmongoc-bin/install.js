const child_process = require('child_process');
const process = require('process');
const fs = require('fs');
const rest = require('@octokit/rest');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
let version = pkg.version;
if (version.includes('-')) {
  version = version.split('-')[0];
}

// Generate template
let template = fs.readFileSync(path.resolve(__dirname, 'libmongoc.gypi.tplt'), 'utf8');
let staticLibs = null;
let libs = null;
if (process.platform === 'win32') {
  libs = [];
  libs.push('bson-1.0.lib');
  libs.push('mongoc-1.0.lib');

  staticLibs = [];
  staticLibs.push('bson-static-1.0.lib');
  staticLibs.push('mongoc-static-1.0.lib');
}
else if (process.platform === 'linux' || process.platform === 'darwin') {
  libs = [];
  libs.push('-l:libbson-1.0.so');
  libs.push('-l:libmongoc-1.0.so');

  staticLibs = [];
  staticLibs.push('-l:libbson-static-1.0.a');
  staticLibs.push('-l:libmongoc-static-1.0.a');
}
if (libs) {
  libs = libs.map(x => `    "${x}",`).join('\r\n');
  let output = template.replace(/BASE_DIR/g, __dirname);
  output = output.replace('LIBRARIES', libs);
  output = output.replace(/\\/g, '\\\\');
  fs.writeFileSync(path.resolve(__dirname, 'libmongoc.gypi'), output);
}
if (staticLibs) {
  staticLibs = staticLibs.map(x => `    "${x}",`).join('\r\n');
  let output = template.replace(/BASE_DIR/g, __dirname);
  output = output.replace('LIBRARIES', staticLibs);
  output = output.replace(/\\/g, '\\');
  fs.writeFileSync(path.resolve(__dirname, 'libmongoc-static.gypi'), output);
}


const octokit = new rest();
octokit.repos.listReleases({
  owner: 'thebecwar',
  repo: 'mongo-c-binaries'
}).then(releases => {
  let release = releases.data.find(x => x.name === 'v' + version);
  if (!release) {
    console.log(`No matching release version. Binaries for ${version} are not available.`);
    process.exit(1);
  }
  let asset = null;
  if (process.platform === 'win32' && process.arch === 'x64') {
    asset = release.assets.find(x => x.name.startsWith('win-x64'));
  }
  else if (process.platform === 'linux' && process.arch === 'x64') {
    asset = release.assets.find(x => x.name.startsWith('linux-x64'));
  }
  else if (process.platform === 'darwin' && process.arch === 'x64') {
    asset = release.assets.find(x => x.name.startsWith('macos-x64'));
  }

  if (!asset) {
    console.log(`No release binary available for platform: ${process.platform} and arch: ${process.arch}`);
    process.exit(1);
  }

  // Download the asset
  octokit.repos.getReleaseAsset({ 
    owner: 'thebecwar', 
    repo: 'mongo-c-binaries', 
    asset_id: asset.id, 
    request: { 
      headers: {
        'Accept': 'application/octet-stream' 
      } 
    } 
  }).then(downloadAsset => {
    fs.writeFileSync(`./${asset.name}`, new Buffer(downloadAsset.data), 'binary');
    console.log(`Downloaded ${asset.name}`);

    // Now we extract it.
    if (process.platform === 'win32') {
      console.log(`powershell Expand-Archive -Force "${__dirname}\\${asset.name}" "${__dirname}"`);
      child_process.exec(`powershell Expand-Archive -Force "${__dirname}\\${asset.name}" "${__dirname}"`, (err, out) => {
        console.log(out);
        fs.unlinkSync(`./${asset.name}`);
        process.exit(err ? 1 : 0);
      });
    }
    else if (process.platform === 'win32') {
      child_process.exec(`tar -xvzf ${__dirname}/${asset.name}`, (err, out) => {
        console.log(out);
        fs.unlinkSync(`./${asset.name}`);
        process.exit(err ? 1 : 0);
      });
    }
  });
});



