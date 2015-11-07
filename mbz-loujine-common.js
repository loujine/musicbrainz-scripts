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

function request(verb, url, param, callback) {
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
}

function requestGET(url, callback) {
    request('GET', url, null, function (xhr) {
        if (xhr.status === 200 && xhr.responseText !== null) {
            callback(xhr.responseText);
        } else {
            console.log('Error ', xhr.status, ': ', url);
        }
    });
}

function requestPOST(url, param, callback) {
    request('POST', url, param, function (xhr) {
        callback(xhr.status);
    });
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

function formatPerformers(relations) {
    var performers = [];
    relations.forEach(function(rel) {
        var type;
        if (rel.type === 'instrument' || rel.type === 'vocal' ||
            rel.type === 'conductor' || rel.type === 'performing orchestra' ||
            rel.type === 'performer') {
            if (rel.type === 'performing orchestra') {
                type = 'orchestra';
            } else if (!rel.attributes.length) {
                type = rel.type;
            } else {
                type = rel.attributes[0];
            }
            performers.push(type + ': ' + rel.artist.name);
        }
    });
    return performers.sort().join(', ');
}

// Replace composer -> performer as recording artist (CSG)
function formatEditInfo(json) {
    var data = [],
        performers = [],
        editNote;
    data.push('edit-recording.name=' + json.name);
    if (!json.comment.length) {
        data.push('edit-recording.comment');
    } else {
        data.push('edit-recording.comment=' + json.comment);
    }
    if (!json.isrcs.length) {
        data.push('edit-recording.isrcs.0');
    } else {
        json.isrcs.forEach(function(isrc, idx) {
            data.push('edit-recording.isrcs.' + idx + '=' + json.isrc);
        });
    }
    json.relationships.forEach(function(rel, idx) {
        var linkType = rel.linkTypeID;
        if (linkType === linkTypePerformer ||
            linkType === linkTypeInstrument || linkType === linkTypeVocals ||
            linkType === linkTypeOrchestra || linkType === linkTypeConductor) {
            performers.push({'name': rel.target.name, 'id': rel.target.id});
        }
        data.push('edit-recording.rel.' + idx + '.relationship_id=' + rel.id);
        data.push('edit-recording.rel.' + idx + '.target=' + rel.target.gid);
        data.push('edit-recording.rel.' + idx + '.link_type_id=' + linkType);
        if (linkType === linkTypeWork) {
            data.push('edit-recording.rel.' + idx + '.backward=1');
        }
    });
    editNote = $('#batch_replace_edit_note')[0].value;
    data.push('edit-recording.edit_note=' + editNote);
    performers.forEach(function(performer, idx) {
        data.push('edit-recording.artist_credit.names.' + idx + '.name=' + performer.name);
        if (idx === performers.length - 1) {
            data.push('edit-recording.artist_credit.names.' + idx + '.join_phrase');
        } else {
            data.push('edit-recording.artist_credit.names.' + idx + '.join_phrase=,+');
        }
        data.push('edit-recording.artist_credit.names.' + idx + '.artist.name=' + performer.name);
        data.push('edit-recording.artist_credit.names.' + idx + '.artist.id=' + performer.id);
    });
    return data.join('&').replace(/ /g, '+');
}

function replaceArtist() {
    // in order to determine the edit parameters required by POST
    // we first load the /edit page and parse the JSON data
    // in the sourceData block
    $('.replace:input:checked:enabled').each(function (idx, node) {
        setTimeout(function () {
            var mbid = node.id.replace('replace-', ''),
                url = '/recording/' + encodeURIComponent(mbid) + '/edit',
                callback = function (info) {
                    console.log('Sending POST ' + mbid + ' edit info');
                    requestPOST(url, formatEditInfo(info), function (status) {
                        node.disabled = true;
                        if (status === 200) {
                            $(node).parent().css('color', 'green');
                        } else {
                            $(node).after(status).parent().css('color', 'red');
                        }
                    });
                };
            console.log('Fetching ' + mbid + ' edit info');

            requestGET(url, function (resp) {
                var info = new RegExp('sourceData: (.*),\n').exec(resp)[1];
                callback(JSON.parse(info));
            });
        }, 2 * idx * mbzTimeout);
    });
}

