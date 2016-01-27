'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Create artist from wikidata
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.01.27
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Fill new artist info from wikidata
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=103641
// @include      http*://*musicbrainz.org/artist/create*
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: wikidata, sidebar (for edit note)
var $ = jQuery,
    sidebar = sidebar,
    wikidata = wikidata;


function parseWikidata(entity) {
    var claims = entity.claims,
        url;
    // name and sort name
    document.getElementById('id-edit-artist.name').value = entity.labels.en.value;
    document.getElementsByClassName('guesscase-title')[0].click();
    document.getElementsByClassName('guesscase-sortname')[0].click();

    // Disambiguation
    if (entity.descriptions.en.value) {
        document.getElementById('id-edit-artist.comment').value = entity.descriptions.en.value;
    }

    // Type and gender
    if (wikidata.fields.type in claims) {
        var type = claims[wikidata.fields.type][0].mainsnak.datavalue.value['numeric-id'];
        document.getElementById('id-edit-artist.type_id').value = type === wikidata.entities.person ? 1 : 0;
    }

    if (wikidata.fields.gender in claims) {
        var gender = claims[wikidata.fields.gender][0].mainsnak.datavalue.value['numeric-id'];
        document.getElementById('id-edit-artist.gender_id').value = gender === wikidata.entities.male ? 1 :
                                                                    gender === wikidata.entities.female ? 2 : 3;
    }

    // ISNI
    if (wikidata.fields.isni in claims) {
        var isni = claims[wikidata.fields.isni][0].mainsnak.datavalue.value;
        document.getElementsByName('edit-artist.isni_codes.0')[0].value = isni;
    }

    function _fillDate(strDate, idx) {
        var date = new Date(strDate.slice(1)); // remove leading "+"
        document.getElementsByClassName('partial-date')[idx].children[1].value = date.getFullYear();
        document.getElementsByClassName('partial-date')[idx].children[2].value = date.getMonth() + 1;
        document.getElementsByClassName('partial-date')[idx].children[3].value = date.getDate();
    }

    // Dates
    if (wikidata.fields.birthDate in claims) {
        var birthDate = claims[wikidata.fields.birthDate][0].mainsnak.datavalue.value.time;
        _fillDate(birthDate, 0);
    }
    if (wikidata.fields.birthPlace in claims) {
        var birthPlace = 'Q' + claims[wikidata.fields.birthPlace][0].mainsnak.datavalue.value['numeric-id'];
        url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + birthPlace + '&format=json';
        $.ajax({
            url: url,
            dataType: 'jsonp',
        }).done(function (data) {
            var entityArea = data.entities[birthPlace],
                input = document.getElementById('id-edit-artist.begin_area.name');
            if (wikidata.fields.mbidArea in entityArea.claims) {
                var mbid = entityArea.claims[wikidata.fields.mbidArea][0].mainsnak.datavalue.value;
                input.value = '/area/' + mbid;
                // $(input).trigger($.Event('keypress', {which: 38}));
                // $(input).focus();
                // $(input).trigger($.Event('keyup'));
                // var e = document.createEvent("KeyboardEvent");
                // e.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, 13, 0);
                // input.dispatchEvent(e);
                // $(input).change();
            } else {
                input.value = entityArea.labels.en.value;
            }
        });
    }
    if (wikidata.fields.deathDate in claims) {
        var deathDate = claims[wikidata.fields.deathDate][0].mainsnak.datavalue.value.time;
        _fillDate(deathDate, 1);
    }
    if (wikidata.fields.deathPlace in claims) {
        var deathPlace = 'Q' + claims[wikidata.fields.deathPlace][0].mainsnak.datavalue.value['numeric-id'];
        url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + deathPlace + '&format=json';
        $.ajax({
            url: url,
            dataType: 'jsonp',
        }).done(function (data) {
            var entityArea = data.entities[deathPlace];
            if (wikidata.fields.mbidArea in entityArea.claims) {
                var mbid = entityArea.claims[wikidata.fields.mbidArea][0].mainsnak.datavalue.value;
                document.getElementById('id-edit-artist.end_area.name').value = 'https://www.musicbrainz.org/area/' + mbid;
            } else {
                document.getElementById('id-edit-artist.end_area.name').value = entityArea.labels.en.value;
            }
        });
    }
}

function fillForm(wikidataURL) {
    function _getWikidataId(wikidataURL) {
        if (wikidataURL.split('/')[2] !== "www.wikidata.org") {
            throw "Not a wikidata link";
        }
        return wikidataURL.split('/')[4];
    }

    var wikiId = _getWikidataId(wikidataURL),
        url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' +
              wikiId + '&format=json';
    $.ajax({
        url: url,
        dataType: 'jsonp',
    }).done(function (data) {
        var entity = data.entities[wikiId];
        if (wikidata.fields.mbidArtist in entity.claims) {
            var mbid = entity.claims[wikidata.fields.mbidArtist][0].mainsnak.datavalue.value;
            if (window.confirm('An artist already exists linked to this wikidata id, ' +
                               'click "ok" to redirect to their page')) {
                window.location.href='/artist/' + mbid;
            } else {
                parseWikidata(entity);
            }
        } else {
            parseWikidata(entity);
        }
    });
    document.getElementById('id-edit-artist.edit_note').value = sidebar.editNote(meta);
}

document.addEventListener('DOMContentLoaded', function () {
    var node = document.getElementById('external-links-editor-container')
               .getElementsByTagName('input')[0];
    node.addEventListener('input', function () {
        var wikidataURL = node.value;
        fillForm(wikidataURL);
    }, false);
    return false;
});

