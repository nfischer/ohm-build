#!/usr/bin/env node
require('shelljs/global');
var path = require('path');

config.fatal = true;

if (process.argv.length < 3) {
  echo('Usage: ' + path.basename(process.argv[1]) + ' <inputFile>');
  echo('  or   ' + path.basename(process.argv[1]) + ' <inputFile> <html_output>');
  exit(1);
}

var inputFile = process.argv[2];
var outputFile = process.argv[3];

if (inputFile === outputFile) {
  echo('Must provide different file names');
  exit(2);
}

// Replace all ohm tags with inlining the code
var regexString = '<script src=".*.ohm" type="text/ohm-js"></script>';
var matchString = grep(regexString, inputFile).trim();
if (!matchString) { // try the other order
  regexString = '<script type="text/ohm-js" src=".*.ohm"></script>';
  matchString = grep(regexString, inputFile).trim();
}
if (!matchString) {
  echo('Could not find script tag');
  exit(3);
}
var ohmFile = path.join(path.dirname(inputFile), matchString.match(/src="(.*)"/)[1]);
var ohmGrammar = cat(ohmFile).trim();
var newTag = matchString
                .replace('></script>', '>\n' + ohmGrammar + '\n</script>')
                .replace(/\s+src=".*"/, '');
var output = sed(matchString.trim(), newTag.trim(), inputFile);
if (output.trim() === cat(inputFile).trim()) {
  echo('No replacement was made. Internal error.');
  exit(4);
}

if (outputFile)
  output.to(outputFile);
else
  echo(output);

console.error('Success!');
