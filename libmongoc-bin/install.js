const child_process = require('child_process');
const process = require('process');
const fs = require('fs');
const rest = require('@octokit/rest');

const octokit = new rest();

octokit.repos.getLatestRelease({
  owner: 'thebecwar',
  repo: 'mongo-c-binaries'
}).then(release => {
  let asset = null;
  if (process.platform === 'win32' && process.arch === 'x64') {
    asset = release.data.assets.find(x => x.name.startsWith('win-x64'));
  }
  else if (process.platform === 'linux' && process.arch === 'x64') {
    asset = release.data.assets.find(x => x.name.startsWith('linux-x64'));
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



