# installr CLI

Allows you to use the basics of the installapp API from the CLI -- useful for scripting

## Why?

I use installrapp.com to distribute mobile apps and having already scripted my app builds, I wanted to script the installr part so I could script the entire build process, from generation of the builds to upload.

I also included a feature that allowed me to do small commits in Git, and have the CLI pull these out and use them for my release notes.

## Install [![NPM version](https://badge.fury.io/js/installr.svg)](http://badge.fury.io/js/installr)

As global CLI:

    $ npm install -g installr

## Usage

List all apps in installr
```
$ installr list --token <YOURAPITOKEN>  
```
## Upload an app
```
$ installr upload MyApp.ipa --token <YOURAPITOKEN> --notes "- Added some cool features" --emails "hello@bouncingfish.com" --teams "QA"
```

## Automatically generate relase notes from git log

If you want to auto-create release notes, do small commits in git, and when it comes to uploading instead of specifying the notes, specify the bundleId of the app:
```
$ installr upload MyApp.ipa --bundleId com.jasonkneen.myApp --token <YOURAPITOKEN> --emails "hello@bouncingfish.com" --teams "QA"
```

If you specify the bundleId, the CLI will check the last build date of the app in the Installr API, then run a git log from that date and add this to the release notes. Coming soon, the ability to override this and specify a date yourself


Suggestions, improvements, PRs, welcome!

### Thanks to

- [amitkothari](https://github.com/amitkothari) for [ti-installr-hook](https://github.com/amitkothari/ti-installr-hook) for inspiration for this

##License
Copyright 2015 Jason Kneen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>

