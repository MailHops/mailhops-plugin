# MailHops Thunderbird Plugin
[www.MailHops.com](https://www.mailhops.com)

<img src="https://www.mailhops.com/images/logos/logo.png" alt="MailHops logo" title="MailHops" align="right" />

MailHops is an email route API. It does a few things:

1. Returns the route an email took based on the Received header IP addresses
1. Shows you a map an email took based on the Received header IP addresses
1. Shows the weather of the sender when you provide a [OpenWeatherMap](https://openweathermap.org/api) API key.
1. Will tag and mark messages as Junk if the travel time is too long.
1. Performs DNSBL check on messages.
1. Shows DKIM and SPF Authentication results.

### MailHops Message View

<img src="images/screenshot-tb78-view.png" alt="MailHops Message View" title="MailHops Message View" style="border: 1px solid #777; width: 400px;" />

### MailHops Route Map

<img src="images/screenshot-map.png" alt="MailHops Route Map" title="MailHops Route Map" style="border: 1px solid #777; width: 400px;" />

### MailHops Options

<img src="images/screenshot-tb78-preferences.png" alt="MailHops Options" title="MailHops Options" style="border: 1px solid #777; width: 400px;" />

### MailHops Dashboard

<img src="images/screenshot-dashboard.png" alt="MailHops Dashboard" title="MailHops Dashboard" style="border: 1px solid #777; width: 400px;" />

### Editing the code
1. After you make changes you can run the [build.sh](build.sh) script
1. Open Postbox or Thunderbird and goto Tools->Add-ons and "Install Add-on From File..."
1. Choose mailhops.xpi from build script

```sh
$ chmod +x build.sh
$ ./build.sh
```

### MailHops API
- [https://github.com/mailhops](https://github.com/mailhops)

### Download
- [Download this plugin from Mozilla](https://addons.mozilla.org/en-US/thunderbird/addon/mailhops/)
