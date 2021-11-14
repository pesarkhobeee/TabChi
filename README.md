# FocusClimb

Replace new tab page with a personal dashboard featuring , desired pictures and inspirations.

## Development

### Firefox

To develop and test this plugin on Firefox please clone this repository on your machine and copy manifest.json from firefox folder to the root folder:
```
git clone git@github.com:pesarkhobeee/focusClimb.git
cd focusClimb
cp firefox/manifest.json .
```
then inside of Firefox address bar go to
```about:debugging#/runtime/this-firefox```
Click on `Load Temporary Add-on` and choose manifest.json file, now you can inspect, test, and reload the plugin. 

### Google Chrome


To develop and test this plugin on Google Chrome please clone this repository on your machine and copy manifest.json from chrome folder to the root folder:
```
git clone git@github.com:pesarkhobeee/focusClimb.git
cd focusClimb
cp chrome/manifest.json .
```
then inside of Firefox address bar go to
```chrome://extensions```
Click on `Load unpacked` and choose manifest.json file, now you can see the details, errors and test the extention.
