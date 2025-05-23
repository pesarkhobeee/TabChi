# TabChi Simplified

A simple Chrome extension that replaces your new tab page with a personalized dashboard featuring essential tools.

## Features

- **Digital Clock**: Always know the time at a glance
- **Notes**: Keep important information readily available with fullscreen mode
- **Weather**: Check the current weather conditions for your location
- **Customizable Background**: Choose a color, upload an image, or use Pexels.com API
- **Custom CSS**: Add your own styling to personalize the dashboard

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome` directory from this repository
5. Open a new tab to see your new dashboard!

## Usage

### Notes
- Type directly in the notes area at the bottom of the screen
- Notes are automatically saved as you type
- Click the fullscreen button to expand notes to full screen

### Weather
1. Click the settings icon in the top left corner
2. Enable the weather toggle
3. Enter your city name
4. Choose your preferred temperature unit (Celsius or Fahrenheit)

### Background
1. Click the settings icon in the top left corner
2. Choose between a color, image, or Pexels background
3. For color backgrounds, select your preferred color from the color picker
4. For image backgrounds, upload an image from your computer
5. For Pexels backgrounds:
   - Get a free API key from [Pexels.com](https://www.pexels.com/api/new/)
   - Enter your API key and a search term
   - Click "Refresh Image" for a new random image

### Custom CSS
1. Click the settings icon in the top left corner
2. Click "Edit CSS" button
3. Enter your custom CSS in the editor
4. Click "Save" to apply your styles

## Built With

- HTML5, CSS3, and JavaScript
- Chrome Extension Manifest V3 API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original TabChi extension
- OpenWeatherMap API for weather data
- Pexels.com API for background images
