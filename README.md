![Screenshot1](Screenshot1.png)

![Screenshot2](Screenshot2.png)

# TabChi

Take charge of your new tabs page and create a personalized dashboard that's tailored to your needs.

Lets redefine the meaning of new tab page. You can install TabChi from below links:
* [Google Chrome](https://chrome.google.com/webstore/detail/tabchi/hejohfomoahmhoiboehdenbolpheiofo)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/focusclimb/)

TabChi offers an array of features designed to enhance your browsing experience, including:

* Gorgeous images or colors tailored to your interests
* Quick access to your favorite websites
* A convenient notepad for jotting down notes on-the-go
* A handy clock to keep you punctual
* Custom CSS capabilities for the perfect look and feel

Never settle for a dull new tab page again. Maximize your browsing potential and kickstart your day with a personalized touch.

TabChi allows you to choose from a diverse selection of themes, such as travel destinations, mouth-watering cuisines, breathtaking landscapes, and much more. Every time you open a new tab, you'll be greeted by a stunning image that matches your chosen theme.

Elevate your browsing experience with TabChi's free and open-source extension. Install it now and transform your new tab page into a visually stunning, custom-tailored dashboard that is distinctly yours.

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
