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

> _Note:_ Also note that the EZ Share card only allows connection to its own WIFI network, i.e. it can't join an existing network. If one needs to connect to the internet at the same time, or to other devices (such as e.g. a networked telescope mount), one needs to connect multiple network interfaces. E.g. I'm connecting my WIFI to the EZ Share, and connect to my internet router via ethernet, to which my SynScan mount control is also connected. One might need to adjust the routing table if it's not configured correctly automatically.
> 

