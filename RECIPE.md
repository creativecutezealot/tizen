# Zype Tizen Recipe

This document outlines step-by-step instructions for creating and publishing a Samsung TV app powered by Zype's API service. 

## Requirements and Prerequisites

#### Tizen Studio with IDE installer

You will need Tizen Studio from Samsung in order to build and package your app. You can find it at: [https://developer.tizen.org/ko/development/tizen-studio/download](https://developer.tizen.org/ko/development/tizen-studio/download).

#### Samsung Seller Account

In order to publish apps on Samsung's marketplace you need to sign up for a Samsung Seller Account at: [http://seller.samsungapps.com/tv/portal/main](http://seller.samsungapps.com/tv/portal/main).


#### Technical Contact

IT or developer support strongly recommended. Creating the final app package requires working with the Terminal to sideload and package the app.


## Creating a New App with the SDK template

1. Clone or download this Github repo.

2. Rename the `configs/defaults.tmpl.js` file to `configs/defaults.js`. Then update the `appKey`, `clientId`, `clientSecret` and `rootPlaylistId`. 

- More info on where to find your `appKey`, `clientId` and `clientSecret` [can be found](https://support.zype.com/hc/en-us/articles/115008501628-API-App-Keys).
- The `rootPlaylistId` is the id of the primary playlist which houses all your content. For more background on how to set this up, [you go here](https://support.zype.com/hc/en-us/articles/115009159068-Managing-Playlist-Relationships).

3. Rename the `config.tmpl.xml` file to `config.xml`. Then update the following in `config.xml`:

- Within the `widget`, set the `< COMPANY WEBSITE >` in the `id` with your company or app's website.
- Inside `tizen:display-name` set `< COMPANY NAME >` to your company's name.
- Inside `tizen:application` set `< APP NAME >` in the `id` with the name of your app. Be sure to remove the whitespace. _Example:_ If your app name is `Intergalactic Sports Network`, the app name in the id should be `randomId.IntergalacticSportsNetwork`.
- Under `author`, replace `< COMPANY WEBSITE >`, `< CONTACT EMAIL >` and `< COMPANY NAME >` with the name and contact info of your company.
- Under `tizen:metadata`, set the `endpoint_URL` with the URL of your Preview JSON. For more information on the Samsung Preview and it's the requirements, see: [http://developer.samsung.com/tv/develop/guides/smart-hub-preview](http://developer.samsung.com/tv/develop/guides/smart-hub-preview). The `action_data` sent is a `videoId` with the video id for the video on Zype. For an example of the preview JSON file, see [http://zype.mixicon.com/tizen/samsung.json](http://zype.mixicon.com/tizen/samsung.json).

```
// Required JSON format
{
  "sections": [
    {
      "title": "< Title/Header of section >",
      "tiles": [
        {
          "title":       "< Title of a video >",
          "subtitle":    "< Subtitle that appears on video tile >",
          "image_ratio": "< '16by9', '4by3', '1by1', or '2by3' >",
          "image_url":   "< URL to video thumbnail >",
          "action_data": "\"videoId\": \"< Zype Video ID >\"", // the app uses this info to link to the correct video
          "is_playable": < true or false >
        },
        // other videos under section
      ]
    },
    // other sections
  ]
}
```

4. Replace image assets. __**Note:**__ You will need addition assets when submitting to the Samsung TV marketplace. These are only the images required within the app itself.

- The _icon.png_ should be a 512x423 PNG. This is your app icon on the Samsung Home screen.
- The _company-logo-45x45.png_ should be a 45x45 PNG. This is a small company icon.
- The _company-logo-72x72.png_ should be a 72x72 PNG. This is a large company icon.
- The _assets/images/app-icon.png_ should be a transparent PNG of your app icon. This is the icon displayed in the app.

#### Configuring Tizen Studio

5. In order to open your app, you will need to download a few packages using the _Package Manager_ in Tizen Studio. You will need to download the following packages:

- `4.0 TV` under the `Main SDK` tab
- `TV Extensions Tools` under the `Extension SDK` tab
- `Samsung Certificate Extension` under the `Extension SDK` tab

6. After you have downloaded the necessary packages in Tizen Studio, you can add the app to Tizen Studio by importing the app folder into your Tizen workspace. 

7. In order to package your app, [create your certificate in Tizen Studio using the Certificate Manager](https://developer.tizen.org/ko/development/tizen-studio/web-tools/managing-projects/certificate-registration). 

#### Building Signed Package

8. Before you build your app package, you should generate a unique id for application. Open up the `config.xml` under your project folder in the _Project Explorer_, navigate to the _Tizen_ tab and click _Generate_ to generate a unique app id for your application.

<a href="https://drive.google.com/uc?export=view&id=15M3elCvrpT4nLV4lzUAuBZX84Qadda5L"><img src="https://drive.google.com/uc?export=view&id=15M3elCvrpT4nLV4lzUAuBZX84Qadda5L" style="width: 500px; max-width: 100%; height: auto" title="Click for the larger version."/></a>

9. After you have your app loaded in Tizen Studio with your certificate create, you can right click the app folder in your _Project Explorer_ and click `Build Signed Package` to create your `.wgt` file. This `.wgt` file is your packaged app which you will upload when submitting to Samsung.

- Before you submit, you can also test your app by [testing it in the simulator](http://developer.samsung.com/tv/develop/getting-started/using-sdk/tv-simulator) or by [loading it on your Samsung TV](http://developer.samsung.com/tv/develop/getting-started/using-sdk/tv-device).