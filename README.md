# installr CLI

Allows you to use the basics of the installrapp API from the CLI -- useful for scripting

## Why?

I use installrapp.com to distribute mobile apps and having already scripted my app builds (for dev / testing and the appstore and playstore), I wanted to script installr so I could upload builds. They key thing for me was making it as automated as possible -- so I wanted something where I can just issue a command and add some emails and the build would be uploaded, the release notes generated from git logs since the last build, and then emailed out to the emails specified.

## Install [![NPM version](https://badge.fury.io/js/installr.svg)](http://badge.fury.io/js/installr)

As global CLI:

    $ npm install -g installr

## List apps

List all apps in installr

	$ installr list --token <YOURAPITOKEN>

## List specific app

List an app based on bundle ID

	$ installr list com.jasonkneen.myapp --token <YOURAPITOKEN>

## Get an app status

Display the status based on an app token

	$ installr status APPTOKEN

## Upload an app

	$ installr upload MyApp.ipa --token <YOURAPITOKEN> --notes "- Added some cool features" --emails "hello@bouncingfish.com" --teams "QA"

## Titanium support

If you're using Titanium, you can put your installr token in the tiapp.xml file

	<property name="installr_token" type="string">TOKEN</property>

and it'll be read from there.

## Automatically generate relase notes from git log

If you want to auto-create release notes, do small commits in git, and when it comes to uploading instead of specifying the notes, specify the bundleId of the app:

	$ installr upload MyApp.ipa --bundleId com.jasonkneen.myApp --token <YOURAPITOKEN> --emails "hello@bouncingfish.com" --teams "QA"

If you specify the bundleId, the CLI will check the last build date of the app in the Installr API, then run a git log from that date and add this to the release notes. If you're using Titanium, the CLI will pick up the app ID from the tiapp.xml file.


Suggestions, improvements, PRs, welcome!

### Thanks to

- [amitkothari](https://github.com/amitkothari) for [ti-installr-hook](https://github.com/amitkothari/ti-installr-hook) for inspiration for this

## License

Copyright &copy; 2015 Jason Kneen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
