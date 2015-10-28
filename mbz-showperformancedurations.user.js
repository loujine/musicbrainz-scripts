// ==UserScript==
// @name         MusicBrainz: Show performance durations
// @author       loujine
// @version      2015.10.29
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformancedurations.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformancedurations.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performance durations on a Work page
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
// we wait for `mbz_timeout` milliseconds between two queries
var mbz_timeout = 1000;


function findPerformanceDuration(mbid, callback) {
    var url = '/ws/2/recording/' +
              encodeURIComponent(mbid) +
              '?fmt=json&limit=1',
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console.log('Error: ', xhr.status);
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


function showPerformanceDurations() {
    var recordings = $('a[href*="/recording/"]').toArray();
    recordings.shift();

    recordings.forEach(function(recording, idx) {
        setTimeout(function() {
            var recording_mbid = recording.href.split('/')[4],
                tr_node = recording.parentElement.parentElement,
                td_node = tr_node.insertCell(-1);
            if (idx === 0) {
                var tbody_node = tr_node.parentElement.parentElement;
                var head = tbody_node.tHead.children[0].insertCell(-1);
                head.textContent = 'Time';
                tbody_node.tBodies[0].children[0].children[1].colSpan += 1;
            }
            var callback = function(resp) {
                td_node.textContent = formatTrackLength(resp.length);
            };
            findPerformanceDuration(recording_mbid, callback);
        }, idx * mbz_timeout);
    });
}

// container defined in mbz-loujine-sidebar.js
$('.work-information').before(
    container
    .append(
        $('<input></input>', {
          'id': 'showdurations',
          'type': 'button',
          'value': 'Show performance durations'
          })
    )
);

$(document).ready(function() {
    $('#showdurations').click(function() {showPerformanceDurations()});
    return false;
});
