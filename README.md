# Configuration

create the file `secrets.json`

platform_url MUST NOT CONTAIN ANY PROTOCOL OR PORT!
rtmp_url MUST NOT CONTAIN ANY PROTOCOL OR PORT!

example contents:
```json
{
    "db_host": "localhost",
    "db_port": 5000,
    "db_database": "ofh",
    "db_user": "api",
    "db_password": "123456",

    "mail_hostname": "smtp.gmail.com",
    "mail_port": 587,
    "mail_secure": false,
    "mail_username": "mail@openflighthub.org",
    "mail_password": "abcde",
    "mail_from": "\"OpenFlightHub DEV\" mail@openflighthub.org",

    "emailHashPepper": "abcde=",

    "platform_name": "OpenFlightHub DEV",
    "platform_url": "dev.openflighthub.org",
    "platform_uuid": "d97dd32f-5977-44f9-ab4d-e34205012dce",

    "dji_cloud_app_id": "12345",
    "dji_cloud_app_key": "cabba",
    "dji_cloud_app_license": "loicense=",

    "mqtt_port": 9002,
    "rtmp_url": "stream.rocks/ome",
    "ome_admission_secret": "1234",


    "rapidapi_adsb_exchange_key": "1234"
}
```

emailHashPepper should be generated via crypto.getBase64(generateSalt(saltLength))

## Github Action -> Runner
make sure that you created an action secret called `SECRETS` here https://github.com/settings/secrets/actions

```json
{
    "db_host": "ofh-database",
    "db_port": 5432,
    "db_database": "ofh",
    "db_user": "api",
    "db_password": "123456",

    "mail_hostname": "smtp.gmail.com",
    "mail_port": 587,
    "mail_secure": false,
    "mail_username": "mail@openflighthub.org",
    "mail_password": "abcde",
    "mail_from": "\"OpenFlightHub\" mail@openflighthub.org",

    "emailHashPepper": "abcde=",

    "platform_name": "OpenFlightHub",
    "platform_url": "hub.openflighthub.org",
    "platform_uuid": "e97dd32f-5977-44f9-ab4d-e34205012dce",

    "dji_cloud_app_id": "12345",
    "dji_cloud_app_key": "cabba",
    "dji_cloud_app_license": "loicense=",

    "mqtt_port": 9002,
    "rtmp_url": "stream.rocks/ome",
    "ome_admission_secret": "1234",


    "rapidapi_adsb_exchange_key": "1234"
}
```

Also create a secret called `SSH_KEY` whith value of the private ssh key from the special user "ci"

## Nginx

###Allow bigger file uploads

```
client_max_body_size 4096m;
```

# Requirements

For building or running locally, this repo requires to also have the repo `database` checked out (in the same folder as this repo). Because we need the `schema.dbml` for the build process.


# Run

## Locally nodejs
In Visual Studio Code, press F5 to launch, or Ctrl+Shift+F5 to restart
hint: this does not produce the api docs (because it takes ages)

## Locally Docker
In Visual Studio Code, press Ctrl+Shift+T to rebuild and restart the docker container


# Development

Read [DEV.md](DEV.md)


# Api Docs
Are being automatically generated using `openapi_spec.yaml` and are served at `/docs`
The docs are generated with [Redocly](https://github.com/Redocly/redoc)

## Configuration
see `redocly.yaml`

# Translation

## Using VS Code and i18n-json-editor extension (recommended)
* install the recommended extensions
* in the left files sidebar find the folder `i18n`
* right click it and select `i18n json editor`

## Manually (not recommended)
* directly edit `/i18n/[[lang]].json` files
* make sure you follow JSON syntax

## variables inside text

use `{{myVariableName}}` for variables inside text. The dev can then use `$t('myTanslationKey', 'en', {myVariableName: 'some value'})`
