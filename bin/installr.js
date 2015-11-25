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
    exec = require('child_process').exec,
    request = require('request'),
    fields = require('fields'),
    path = require('path'),
    _ = require('underscore'),
    Table = require('cli-table');

function listApps(params) {

    console.log(chalk.yellow('Fetching apps..'));

    var r = request.get({
        url: 'https://www.installrapp.com/apps.json',
        headers: {
            'X-InstallrAppToken': params.token
        }
    }, function(err, httpResponse, body) {
        // instantiate
        var table = new Table({
            head: [chalk.yellow('id'), chalk.yellow('AppId'), chalk.yellow('Platform'), chalk.yellow('Version'), chalk.yellow('buildId'), chalk.yellow('Installs')],
            colWidths: [8, 40, 10, 15, 10, 10]
        });

        JSON.parse(body).appList.forEach(function(app) {
            table.push(
                [app.id, app.appId, app.type, app.latestBuild.versionNumber, app.latestBuild.id, app.latestBuild.numberInstalled]
            );
        });

        console.log(table.toString());
    });
}

function uploadApp(params) {
    console.log(chalk.yellow('Uploading app to installr'));

    var r = request.post({
        url: 'https://www.installrapp.com/apps.json',
        headers: {
            'X-InstallrAppToken': params.token
        }
    }, function(err, httpResponse, body) {
        if (err) {
            console.log(err);
            finished();
        } else {

            console.log(chalk.yellow('App uploaded, sending to testers..'));

            var resp = JSON.parse(body);

            var r = request.post({
                url: 'https://www.installrapp.com/apps/' + resp.appData.id + '/builds/' + resp.appData.latestBuild.id + '/team.json',
                headers: {
                    'X-InstallrAppToken': params.token
                }
            }, function(err, httpResponse, body) {
                if (err) {
                    console.log(chalk.green(err));
                } else {
                    console.log(chalk.green('Sent to ' + params.emails));

                }
            });

            var form = r.form();

            form.append('notify', params.emails);

        }
    });



    var build_file = afs.resolvePath(params.filePath);

    var form = r.form();

    /// specify the file
    form.append('qqfile', fs.createReadStream(build_file));

    // release notes
    form.append('releaseNotes', params.notes);

    // team names
    if (params.teams) {
        form.append('notify', params.teams);
    }

}

// main function
function installrapp() {

    var params = {};

    // setup CLI
    program
        .version(pkg.version, '-v, --version')
        .usage('[options]')
        .description(pkg.description)
        .option('-u, --upload [filename]', 'Uploads an app to installr --- checks for iTunes ipa, current folder, specific path')
        .option('-l, --list', 'Lists apps')
        .option('-n, --notes <notes>', 'Release notes')
        .option('-e, --emails <emails>', 'Comma-separated list of emails to send to')
        .option('-t, --teams <names>', 'Comma-separated list of team names to send to')
        .option('-c, --token <token>', 'Set the installrapp API token to use')

    program.parse(process.argv);

    // check for a new version
    updateNotifier({
        packageName: pkg.name,
        packageVersion: pkg.version
    }).notify();

    if (program.notes) {
        params.notes = program.notes;
    } else {
        exec(gitLog, function(e, out) {
            params.notes = out;
        });
    }

    if (program.emails) {
        params.emails = program.emails;
    }

    if (program.teams) {
        params.teams = program.teams;
    }

    if (program.token) {
        params.token = program.token;
    } else {
        console.log("No API Token");
        return;
    }

    if (program.upload) {

        if (fs.existsSync("'" + iTunesPath.toString() + program.upload) + "'") {
            params.filePath = iTunesPath + program.upload;
        } else if (fs.existsSync("./dist/" + program.upload)) {
            params.filePath = "./dist/" + program.upload;
        } else if (fs.existsSync("./" + program.upload)) {
            params.filePath = "./" + program.upload;
        } else {
            console.log(chalk.red('upload file not found!'));
        }

        uploadApp(params);

    } else if (program.list) {
        listApps(params);
    }
}


installrapp();

