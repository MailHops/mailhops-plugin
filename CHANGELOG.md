# Change Log

## 4.3.0 - 2021-09-10

- Added support for Thunderbird 93
- Added country filter option
- Fixes map launching on cached messages

## 4.2.1 - 2021-03-29

- Added a check for parsing the mail date.  A bad formatted message date was failing to load the plugin.

## 4.2.0 - 2021-03-23

- Added dark/light mode option.
- Fixed display if html characters exist in ASN name.
- Changed default for travel_time_junk option to off.

## 4.1.0 - 2020-11-12

- Added daily message cache.
- Added retrieve API key in preferences.

## 4.0.3 - 2020-11-11

- Fixed km distance unit

## 4.0.2 - 2020-11-11

- TB78 Updates

## 4.0.0 - 2020-11-10
- Support for Thunderbird 78.*
- Complete rewrite of code structure 
  - (thanks to Jürgen Ernst and his [Display mail user agent](https://addons.thunderbird.net/ja/thunderbird/addon/display-mail-user-agent-t/) for some direction)

## 3.8.0 - 2020-06-02

### Added
- ASN Org in hops list [https://en.wikipedia.org/wiki/Autonomous_system_(Internet)](https://en.wikipedia.org/wiki/Autonomous_system_(Internet))

## 3.6.8 - 2019-12-09

### Added
- Support for Thunderbird 68.*

# Change Log

## 3.2 - 2019-04-03

### Added
- Country column to message list

## 3.1.4 - 2017-07-24

### Fixed
- IP test when IP regex finds a semantic version with a trailing colon

## 3.1.3 - 2017-07-22

### Added
- Secure host icon to hop list

### Changed
- Moved hop list from drop down to new layout bubble

## 3.1.2 - 2017-07-18

### Fixed
- Account Message Bubble

## 3.1.1 - 2017-07-15

### Added
- Language Pull Requests
- Account Messages

### Fixed
- Missing blacklisted icon in MailHops bar

## 3.1.0 - 2017-02-21

### Fixed
- IP order when Received header has multiple IPs.  

## 3.0.3 - 2017-01-13

### Added
- More locale translations for preferences

### Fixed
- Messages marked as local due to missing countryCode but had coords
- Missing preferences styles

## 3.0.2 - 2017-01-12

### Added
- Display option for hiding the MailHops bar for CompactHeaders add-on
- Started adding locale translations for preferences

## 3.0.1 - 2017-01-07

### Added
- Display styles in settings to customize MailHops bar background color, font color and font size
- Polish language locale

### Removed
- Display show options, data is now always shown for:
  - Unsubscribe link
  - Mailer
  - DKIM
  - SPF
  - DNSBL

### Fixed
- Received header id parsed as an IP address
- MailHops bar showing up on load with no message selected


## 3.0.0 - 2016-12-26

### Added
- MailHops Bar for matching styles across supported mail clients

### Removed
- Thunderbird specific styles and MailHops bar from the header
- Postbox specific styles and MailHops sidebar display

## 2.0.0 - 2016-10-10

### Added
- MailHops API v2 membership
- Filters section in preferences
- Tag and mark as junk by CountryCode
- Time Traveled, total time it took for the email to reach you

### Fixed
- Bug if multiple IPs exist in one Received header
- Check for API response HTTP status code


## 1.0.8 - 2016-5-25

### Added
- Styles Updates
- SSL Default

## 1.0.7 - 2015-11-13

### Fixed
- Check that IP address starts with digit less than 240 (IANA-RESERVED)


## 1.0.6 - 2015-11-12

### Fixed
- Missing try/catch around JSON.parse


## 1.0.3 - 2015-09-18

### Added
- Map provider in preferences

### Fixed
- Save language in preferences
- Display if only city in response


## 1.0.1 - 2015-06-10
### Added
- Context.IO sponsored message, build something awesome with their API!

### Fixed
- Removed loading indicator when no received headers found
- Secure message parsing


## 1.0.0 - 2015-05-31
### Changed
- Combined Thunderbird and Postbox code into one plugin

### Fixed
- Fix mismatch IP from Microsoft SMTP id in received header


## 0.9.0 - 2015-05-30
### Changed
- Update map style and size
- Update logo

### Added
- IPV6 support
- Language support for 'de','en','es','fr','ja','pt-BR','ru','zh-CN'
- What3Words, gets the 3 words for the geo of the sender
- Forecast.IO, gets the weather from the sender, API key needs to be added in preferences

### Fixed
- Fix mismatch IP from Microsoft SMTP id in Received header
