# 📲 iOS Simulator App Exporter

[![CircleCI Build Status](https://circleci.com/gh/charpeni/ios-simulator-app-exporter.svg?style=shield)](https://circleci.com/gh/charpeni/ios-simulator-app-exporter)
[![npm version](https://badge.fury.io/js/ios-simulator-app-exporter.svg)](http://badge.fury.io/js/ios-simulator-app-exporter)

iOS Simulator App Exporter is a script that will help you to list all your simulator devices and their applications, so you can quickly locate and export applications.

- **Easily** share an iOS simulator app to other simulator, even on other mac.
- **No need to build** the Xcode project and deal with dependencies.
- **Ideal** to share an internal build with your teammates without them having to deal with build tools.

![Example](https://user-images.githubusercontent.com/7189823/55847008-c17ac480-5b15-11e9-8fd0-a1dc2b03ec9a.gif)

## Motivation

My principal motivation behind this was to allow my teammates without the project installed and configured to quickly test multiple iOS devices through simulators without TestFlight and physical devices. I used this to share proofs of concept, design iterations, etc. to teammates from other departments who don't want to deal with build tools to give feedback.

To share an iOS application to physical devices, you will have to generate a `.ipa` file, then distribute it with TestFlight or other alternative tools. But, to share an iOS application to simulators, you just have to find the generated `.app` on the selected simulator and export it.

Searching for that on Google lead to answers like this:

> I am trying to export it and install it to another simulator in other mac?
>
> You can't. That's not how the simulator works. To run the app on another Mac, you need to copy the Xcode project to the other Mac and run that project in Xcode on that other Mac.
>
> https://stackoverflow.com/a/34170855

But, actually, it works with the simulator too!

## Installation

`ios-simulator-app-exporter` is written in JavaScript and is available with the JS package manager of your choice ([Yarn](https://yarnpkg.com/en/), [npm](https://www.npmjs.com/get-npm), and probably others). 

Pick the one you are more comfortable with.

### Yarn

```
yarn global add ios-simulator-app-exporter
```

### npm

```
npm install -g ios-simulator-app-exporter
```

## Usage

Run the following command:

```
ios-simulator-app-exporter
```

> In case you have active simulators, you will be prompt if you want to filter on active devices.

Select the application you would like to export, they are grouped by device.

Once selected, you will have the `Full path` of the `.app` you are looking for and his `Directory`.

> (With OS X , press ⌘ and click on the path to open it).

Then, you can share it, and finally, install it to another iOS simulator by dragging it onto it.

<p align="center">
  <img src="https://user-images.githubusercontent.com/7189823/55923469-bdad7780-5bd3-11e9-8d01-f1a3131d2d56.gif" height="500" />
</p>

## License

iOS Simulator App Exporter is [MIT Licensed](LICENSE).
