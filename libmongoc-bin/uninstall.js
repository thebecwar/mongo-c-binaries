const fs = require('fs');

function deleteFiles(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFiles(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

deleteFiles(`${__dirname}/bin`);
deleteFiles(`${__dirname}/include`);
deleteFiles(`${__dirname}/lib`);
deleteFiles(`${__dirname}/share`);

if (fs.existsSync('./libmongoc.gypi')) fs.unlinkSync('./libmongoc.gypi');
if (fs.existsSync('./libmongoc-static.gypi')) fs.unlinkSync('./libmongoc-static.gypi');
