'use strict';
// ==UserScript==
// @name         MusicBrainz: common lib
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.01.24
// @description  musicbrainz.org: common functions
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var server = {
    'link': {
        'instrument': 148,
        'vocals': 149,
        'orchestra': 150,
        'conductor': 151,
        'performer': 156,
        'work': 278,
        'place': 693,
        'area': 698
    },
    'attr': {
        'strings': 69,
        'cello': 84,
        'violin': 86,
        'piano': 180,
        'bowedStrings': 275,
        'live': 578,
        'partial': 579
    },
    // https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
    // we wait for `server.timeout` milliseconds between two queries
    'timeout': 1000
};

var requests = function () {
    var self = {};

    self._request = function (verb, url, param, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                    callback(xhr);
            }
        };
        xhr.open(verb, url, true);
        if (verb === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Content-length', param.length);
            xhr.setRequestHeader('Connection', 'close');
        }
        xhr.timeout = 10000;
        xhr.ontimeout = function () {
            console.error('The request for ' + url + ' timed out.');
            };
        xhr.send(param);
    };

    self.GET = function (url, callback) {
        self._request('GET', url, null, function (xhr) {
            if (xhr.status === 200 && xhr.responseText !== null) {
                callback(xhr.responseText);
            } else {
                console.log('Error ', xhr.status, ': ', url);
            }
        });
    };

    self.POST = function (url, param, callback) {
        self._request('POST', url, param, function (xhr) {
            callback(xhr.status);
        });
    };
    return self;
}();

var helper = function () {
    var self = {};

    // musicbrainz-server/root/static/scripts/common/utility/formatTrackLength.js
    self.formatTrackLength = function(milliseconds) {
        if (!milliseconds) {
            return '';
        }
        if (milliseconds < 1000) {
            return milliseconds + ' ms';
        }
        var oneMinute = 60;
        var oneHour = 60 * oneMinute;
        var seconds = Math.round(milliseconds / 1000.0);
        var hours = Math.floor(seconds / oneHour);
        seconds = seconds % oneHour;
        var minutes = Math.floor(seconds / oneMinute);
        seconds = seconds % oneMinute;
        var result = ('00' + seconds).slice(-2);
        if (hours > 0) {
            result = hours + ':' + ('00' + minutes).slice(-2) + ':' + result;
        } else {
            result = minutes + ':' + result;
        }
        return result;
    };

    self.comparefct = function(a, b) {
        // Sort function for performers in the recording artist list
        var link = server.link,
            order = [link.vocals, link.instrument, link.orchestra,
                     link.conductor, link.performer];
        if (a.link === b.link) {return 0;}
        return order.indexOf(a.link) > order.indexOf(b.link) ? 1 : -1;
    };
    return self;
}();
