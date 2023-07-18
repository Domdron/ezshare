A tool which automatically downloads new images from an [EZ Share WIFI SD 
card/adapter](http://ezshare.com.cn/services-wifisd_adapter-documents.html).  

## Build
```shell
npm install
npm run build

```

## Usage
```
npm run start -- <directory-url> <output-directory>
```

The directory-url is the directory listing page on the webserver of the EZ Share 
card. For example, with the card's webserver's IP address mapped to hostname 
ezshare.card (e.g. in /etc/hosts), and with an Olympus PEN camera, the 
directory-url would be http://ezshare.card/dir?dir=A:%5CDCIM%5C100OLYMP.

For this particular case, one can also `npm run oly`. 
