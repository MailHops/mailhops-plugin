# MailHops Thunderbird and Postbox Plugin
[www.MailHops.com](http://www.mailhops.com)

<img src="http://www.mailhops.com/images/logos/mailhops395.png" width="200" alt="MailHops logo" title="MailHops" align="right" />

MailHops is an email route API. It does two things:

1. Returns a route an email took based on the Received header IP addresses
2. Returns a map an email took based on the Received header IP addresses

The route will contain DNSBL lookup results, hostname lookup results and What3Words geo locations. 

1. Edit files
2. Run [build.sh](build.sh) script
3. Open Postbox and goto Tools->Add-ons and "Install Add-on From File..."
4. Choose mailhops.xpi from build script

```sh
$ chmod +x build.sh
$ ./build.sh
```

## API
Host your own API
- [API](https://github.com/avantassel/mailhops-api)

## Plugins
- [Download](https://addons.mozilla.org/en-US/thunderbird/addon/mailhops/)