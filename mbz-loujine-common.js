'use strict';
// ==UserScript==
// @name         MusicBrainz: common files
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.05
// @description  musicbrainz.org: common functions for relationship editor scripts
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var linkTypeInstrument = 148,
    linkTypeVocals = 149,
    linkTypeOrchestra = 150,
    linkTypeConductor = 151,
    linkTypePerformer = 156,
    linkTypeWork = 278,
    linkTypePlace = 693,
    linkTypeArea = 698,
    attrIdStrings = 69,
    attrIdCello = 84,
    attrIdViolin = 86,
    attrIdPiano = 180,
    attrIdBowedStrings = 275,
    attrIdLive = 578,
    attrIdPartial = 579;

// https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
// we wait for `mbz_timeout` milliseconds between two queries
var mbzTimeout = 1000;

function requestGET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(xhr.responseText);
            } else {
                console.log('Error ', xhr.status, ': ', url);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.timeout = 5000;
    xhr.ontimeout = function() {
        console.error('The request for ' + url + ' timed out.');
        };
    xhr.send(null);
}


// musicbrainz-server/root/static/scripts/common/utility/formatTrackLength.js
function formatTrackLength(milliseconds) {
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
}


