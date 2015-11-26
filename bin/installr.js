#!/usr/bin/env node

// need to make this configurable
var iTunesPath = "~/music/iTunes/iTunes\ Media/Mobile\ Applications/";

// need to make this configurable
var gitLog = 'git log --since=today --pretty="- %s"'

var program = require('commander'),
    chalk = require('chalk'),
    updateNotifier = require('update-notifier'),
    fs = require('fs'),
    afs = require('node-appc').fs,
    pkg = require('../package.json'),
    exec = require('exec-sync2'),
    request = require('request'),
    fields = require('fields'),
    path = require('path'),
    _ = require('underscore'),
    Table = require('cli-table'),
    moment = require('moment'),
    config = {};


function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function listApps(id) {

    console.log(chalk.blue(id ? 'Fetching apps matching ' + id : 'Fetching apps'));

    var r = request.get({
        url: 'https://www.installrapp.com/apps.json',
        headers: {
            'X-InstallrAppToken': config.token
        }
    }, function(err, httpResponse, body) {

        if (!isJSON(body)) {
            console.log(chalk.red("Error: check the API token is valid"));
            return;
        }
        // instantiate
        var table = new Table({
            head: [chalk.white('id'), chalk.white('AppId'), chalk.white('Platform'), chalk.white('Version'), chalk.white('buildId'), chalk.white('Installs')],
            colWidths: [8, 40, 10, 15, 10, 10]
        });

        JSON.parse(body).appList.forEach(function(app) {

            function writeRow() {
                table.push(
                    [ chalk.white(app.id), chalk.white(app.appId),  chalk.white(app.type),  app.latestBuild.versionNumber, app.latestBuild.id, chalk.white(app.latestBuild.numberInstalled)]
                );
            }

            if (id && app.appId === id) {
                writeRow();
                return;
            } else if (!id) {
                writeRow();
            }
        });

        console.log(table.toString());
    });
}

function getTiAppConfig() {
    if (fs.existsSync('./tiapp.xml')) {
        console.log(chalk.blue("Titanium Project detected"));
        var tiapp = require('tiapp.xml').load("./tiapp.xml");

        config.tiAppId = tiapp.id;
        config.token = tiapp.getProperty("installr_token");
    }

}

function getAppDetails(callback) {
    console.log(chalk.yellow('Fetching specific app details..'));

    var r = request.get({
        url: 'https://www.installrapp.com/apps.json',
        headers: {
            'X-InstallrAppToken': config.token
        }
    }, function(err, httpResponse, body) {

        JSON.parse(body).appList.forEach(function(app) {

            if (app.appId == config.bundleId) {
                callback(app);
            }
        });

    });
}


function uploadApp() {
    console.log(chalk.yellow('Uploading app to installr'));

    var r = request.post({
        url: 'https://www.installrapp.com/apps.json',
        headers: {
            'X-InstallrAppToken': config.token
        }
    }, function(err, httpResponse, body) {
        if (err) {
            console.log(err);
        } else {

            console.log(chalk.yellow('App uploaded, sending to testers..'));

            var resp = JSON.parse(body);

            var r = request.post({
                url: 'https://www.installrapp.com/apps/' + resp.appData.id + '/builds/' + resp.appData.latestBuild.id + '/team.json',
                headers: {
                    'X-InstallrAppToken': config.token
                }
            }, function(err, httpResponse, body) {
                if (err) {
                    console.log(chalk.green(err));
                } else {
                    console.log(chalk.green('Sent to ' + config.emails));

                }
            });

            var form = r.form();

            form.append('notify', config.emails);
        }
    });


    var build_file = afs.resolvePath(config.filePath);

    if (config.latestBuildDate && !config.notes) {
        config.notes = exec('git log --since=' + config.latestBuildDate + ' --pretty="- %s"');
    }

    var form = r.form();

    /// specify the file
    form.append('qqfile', fs.createReadStream(build_file));


    // release notes
    if (config.notes) {
        form.append('releaseNotes', config.notes);
    }


    // team names
    if (config.teams) {
        form.append('notify', config.teams);
    }

}

// main function
function installrapp() {

    getTiAppConfig();

    // setup CLI
    program
        .version(pkg.version, '-v, --version')
        .usage('[options]')
        .description(pkg.description)
        .option('-u, --upload [filename]', 'Uploads an app to installr --- checks for iTunes ipa, current folder, specific path')
        .option('-l, --list <name>', 'Lists apps')
        .option('-n, --notes <notes>', 'Release notes')
        .option('-e, --emails <emails>', 'Comma-separated list of emails to send to')
        .option('-t, --teams <names>', 'Comma-separated list of team names to send to')
        .option('-c, --token <token>', 'Set the installrapp API token to use')
        .option('-b, --bundleId <id>', 'The bundleId of the app')

    program.parse(process.argv);

    // check for a new version
    updateNotifier({
        packageName: pkg.name,
        packageVersion: pkg.version
    }).notify();

    if (program.notes) {
        config.notes = program.notes;
    }

    if (program.emails) {
        config.emails = program.emails;
    }

    if (program.teams) {
        config.teams = program.teams;
    }

    if (program.bundleId) {
        config.bundleId = program.bundleId;
    }

    if (program.token) {
        config.token = program.token;
    }

    if (program.upload) {

        if (fs.existsSync("./" + program.upload)) {
            console.log("Using local app file");
            config.filePath = "./" + program.upload;
        } else if (fs.existsSync("./dist/" + program.upload)) {
            console.log("Using ./dist folder app file");
            config.filePath = "./dist/" + program.upload;
        } else if (fs.existsSync("'" + iTunesPath.toString() + program.upload) + "'") {
            console.log("Using iTunes app file");
            config.filePath = iTunesPath + program.upload;
        } else {
            console.log(chalk.red('upload file not found!'));
        }

        if (config.bundleId) {
            getAppDetails(config, function(app) {
                config.latestBuildDate = app.latestBuild.dateCreated;
                uploadApp();
            });


        } else {
            uploadApp();
        }

        //uploadApp(config);

    } else if (program.list) {
        listApps(program.list[0]);
    }
}


installrapp();
