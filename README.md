# Ionic Screenshots
Take several screenshots of different sizes for an ionic project

# Prerequesites
Make sure you have the latest version of Ionic and PhantomJS, as this requires the use of `ionic serve` and since Ionic uses WOFF fonts, needs an updated PhantomJS (you might have to compile your own)

# Usage
Running `./run.sh <ionic folder>` will generate all the needed screenshots under a "screenshots" folder, organized by device.

# Info

Progress: ~40%

What's missing:
- The actual code to loop through all the pages
- The code to process actions
