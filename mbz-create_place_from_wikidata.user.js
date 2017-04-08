/* global $ _ relEditor sidebar wikidata parseWD */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Fill place info from wikidata
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.4.8
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_place_from_wikidata.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_place_from_wikidata.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Fill place info from wikidata
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/place/create*
// @include      http*://*musicbrainz.org/place/*/edit
// @exclude      http*://*musicbrainz.org/place/*/alias/*/edit
// @include      http*://*mbsandbox.org/place/create*
// @include      http*://*mbsandbox.org/place/*/edit
// @exclude      http*://*mbsandbox.org/place/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

function parseWikidata(entity) {
    var lang = wikidata.language,
        value;
    if (!(lang in entity.labels)) {
        lang = Object.keys(entity.labels)[0];
    }
    // name and sort name
    parseWD.setValue('id-edit-place.name', entity.labels[lang].value);

    // Coordinates
    if (parseWD.existField(entity, 'coordinates')) {
        var input = document.getElementById('id-edit-place.coordinates');
        var coord = parseWD.valueFromField(entity, 'coordinates');
        input.value = coord.latitude + ', ' + coord.longitude;
    }

    // Dates & places
    if (parseWD.existField(entity, 'birthDate')
            || parseWD.existField(entity, 'inceptionDate')) {
        var field = parseWD.existField(entity, 'birthDate') ? 'birthDate' : 'inceptionDate';
        parseWD.fillDate(entity, 'place', field, 'begin_date');
    }

    if (parseWD.existField(entity, 'deathDate')
            || parseWD.existField(entity, 'dissolutionDate')) {
        var field = parseWD.existField(entity, 'deathDate') ? 'deathDate' : 'dissolutionDate';
        parseWD.fillDate(entity, 'place', field, 'end_date');
    }
}

function fillForm(wikiId) {
    parseWD.request(wikiId, parseWikidata);
    parseWD.setValue('id-edit-place.edit_note', sidebar.editNote(GM_info.script));
}

(function displayToolbar(relEditor) {
    $('div.half-width').prepend(
        relEditor.container()
        .append(
            $('<p>You can first add the wikidata link to retrieve automatically some information</p>')
        )
    );
})(relEditor);

$(document).ready(function() {
    var nodes = document.getElementById('external-links-editor-container')
                .getElementsByTagName('input');
    _.forEach(nodes, function(node) {
        node.addEventListener('input', function () {
            if (node.value.split('/')[2] === "www.wikidata.org") {
                fillForm(node.value.split('/')[4].trim());
            }
        }, false);
    });
    return false;
});

// test data:
// https://www.wikidata.org/wiki/Q2303621
