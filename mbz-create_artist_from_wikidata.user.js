/* global $ _ relEditor sidebar wikidata parseWD */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Fill artist info from wikidata
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.12.11
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Fill artist info from wikidata
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=162598
// @include      http*://*musicbrainz.org/artist/create*
// @include      http*://*musicbrainz.org/artist/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/alias/*/edit
// @include      http*://*mbsandbox.org/artist/create*
// @include      http*://*mbsandbox.org/artist/*/edit
// @exclude      http*://*mbsandbox.org/artist/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}



function parseWikidata(entity) {
    var lang = wikidata.language,
        value;
    if (!(lang in entity.labels)) {
        lang = Object.keys(entity.labels)[0];
    }
    // name and sort name
    parseWD.setValue('id-edit-artist.name', entity.labels[lang].value);
    $(document.getElementById('id-edit-artist.name')).trigger('change');
    document.getElementsByClassName('guesscase-sortname')[0].click();


    // Type and gender
    if (parseWD.existField(entity, 'type')) {
        var type = parseWD.valueFromField(entity, 'type')['numeric-id'];
        switch(type) {
            case wikidata.entities.person:
                value = 1;
                break;
            case wikidata.entities.stringQuartet:
            case wikidata.entities.orchestra:
            case wikidata.entities.band:
            case wikidata.entities.rockBand:
                value = 2;
                break;
            default:
                value = 0;
                break;
        }
        parseWD.setValue('id-edit-artist.type_id', value);
    }

    if (parseWD.existField(entity, 'gender')) {
        var gender = parseWD.valueFromField(entity, 'gender')['numeric-id'];
        switch(gender) {
            case wikidata.entities.male:
                value = 1;
                break;
            case wikidata.entities.female:
                value = 2;
                break;
            default:
                value = 3;
                break;
        }
        parseWD.setValue('id-edit-artist.gender_id', value);
    }

    // Area
    if (parseWD.existField(entity, 'citizen') || parseWD.existField(entity, 'country')) {
        var field = parseWD.existField(entity, 'citizen') ? 'citizen' : 'country';
        var area = 'Q' + parseWD.valueFromField(entity, field)['numeric-id'];
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + area + '&format=json',
            dataType: 'jsonp'
        }).done(function(data) {parseWD.fillArea(data, area, 'area', lang)});
    }

    // ISNI
    if (parseWD.existField(entity, 'isni')) {
        var isniBlock = document.getElementsByClassName('edit-artist.isni_codes-template')[0].parentElement;
        var isni = parseWD.valueFromField(entity, 'isni');
        var existing_isni = [],
            fields = isniBlock.getElementsByTagName('input');
        for (var input of fields) {
            existing_isni.push(input.value.split(" ").join(""));
        }
        existing_isni.splice(0, 1); // template
        if (existing_isni.length === 1 && existing_isni[0] === "") {
            document.getElementsByName('edit-artist.isni_codes.0')[0].value = isni;
        } else if (!_.contains(existing_isni, isni.split(" ").join(""))) {
            isniBlock.getElementsByClassName('form-row-add')[0].getElementsByTagName('button')[0].click();
            document.getElementsByName('edit-artist.isni_codes.' + existing_isni.length)[0].value = isni;
        }
    }

    // Dates & places
    if (parseWD.existField(entity, 'birthDate')
            || parseWD.existField(entity, 'inceptionDate')) {
        var field = parseWD.existField(entity, 'birthDate') ? 'birthDate' : 'inceptionDate';
        parseWD.fillDate(parseWD.valueFromField(entity, field), 'begin_date');
    }

    if (parseWD.existField(entity, 'birthPlace')
            || parseWD.existField(entity, 'formationLocation')) {
        var field = parseWD.existField(entity, 'birthPlace') ? 'birthPlace' : 'formationLocation';
        var birthArea = 'Q' + parseWD.valueFromField(entity, field)['numeric-id'];
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + birthArea + '&format=json',
            dataType: 'jsonp'
        }).done(function(data) {parseWD.fillArea(data, birthArea, 'begin_area', lang)});
    }

    if (parseWD.existField(entity, 'deathDate')
            || parseWD.existField(entity, 'dissolutionDate')) {
        var field = parseWD.existField(entity, 'deathDate') ? 'deathDate' : 'dissolutionDate';
        parseWD.fillDate(parseWD.valueFromField(entity, field), 'end_date');
    }

    if (parseWD.existField(entity, 'deathPlace')) {
        var deathArea = 'Q' + parseWD.valueFromField(entity, 'deathPlace')['numeric-id'];
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + deathArea + '&format=json',
            dataType: 'jsonp'
        }).done(function(data) {parseWD.fillArea(data, deathArea, 'end_area', lang)});
    }

    var existing_domains = [],
        fields = document.getElementById("external-links-editor").querySelectorAll('input');
    for (var link of fields) {
        existing_domains.push(link.value.split('/')[2]);
    }
    existing_domains = existing_domains.slice(0, existing_domains.length - 1);

    Object.keys(wikidata.urls).forEach(function(externalLink) {
        var domain = wikidata.urls[externalLink].split('/')[2];
        if (parseWD.existField(entity, externalLink) &&
            !_.includes(existing_domains, domain)) {
            var inputs = document.getElementById('external-links-editor')
                         .getElementsByTagName('input'),
                input = inputs[inputs.length - 1];
            input.value = wikidata.urls[externalLink]
                          + parseWD.valueFromField(entity, externalLink);
            input.dispatchEvent(new Event('input', {'bubbles': true}));
        }
    });

}

function fillForm(wikiId) {
    $.ajax({
        url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
             + wikiId + '&format=json',
        dataType: 'jsonp'
    }).done(function (data) {
        console.info('wikidata returned: ', data);
        if (data.error) {
            alert('wikidata returned an error:\n' +
                  'code: ' + data.error.code + '\n' +
                  'wikidata ID: "' + data.error.id + '"\n' +
                  'info: ' + data.error.info);
            return;
        }
        var entity = data.entities[wikiId];
        if (parseWD.existField(entity, 'mbidArtist')) {
            var mbid = parseWD.valueFromField(entity, 'mbidArtist');
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
    parseWD.setValue('id-edit-artist.edit_note', sidebar.editNote(meta));
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
// https://www.wikidata.org/wiki/Q11331342
// https://www.wikidata.org/wiki/Q3290108 invalid date with precision=9
// https://www.wikidata.org/wiki/Q3193910 invalid date with precision=7
