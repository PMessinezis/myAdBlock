

var URL_class=function (url) {
    var s
    var t
    if (url){
        s = url.match(/(^https?:\/\/)/)
        if (s) this.protocol = s[0];
        s = url.match(/^https?:\/\/(.*?)\//)
        if (s) {
            s = s[1]
            this.host = s.toLowerCase();
            t = s.match(/(^.*?@)/)
            if (t) {
                this.credentials = t[1]
                t = this.host
                t = t.match(/.*@(.*)/)
                if (t) this.host = t[1]
            }
            s = this.host
            t = s.match(/(.+?)(:\d+)/)
            if (t)
                if (t[2]) {
                    this.host = t[1]
                    this.port = t[2]
                }
            s = url.match(/^https?:\/\/.*?(\/.*)$/)
            if (s) this.therest = s[1]
        }
    }
}

URL_class.prototype.str = function() {
    var s = ""
            // protocol/credentials/host/port/therest
    if (this.protocol) s = s + this.protocol
    if (this.credentials) s = s + this.credentials
    if (this.host) s = s + this.host
    if (this.port) s = s + this.port;
    if (this.therest) s = s + this.therest
    return s;
}

URL_class.prototype.redirect = function(newhost, newport) {
    if (newhost) this.host = newhost
    if (newport) this.port = newport
    return this;
}

