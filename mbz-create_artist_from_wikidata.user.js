/* global $ _ relEditor sidebar wikidata parseWD */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Fill artist info from wikidata
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.4.8
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Fill artist info from wikidata
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/artist/create*
// @include      http*://*musicbrainz.org/artist/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/alias/*/edit
// @include      http*://*mbsandbox.org/artist/create*
// @include      http*://*mbsandbox.org/artist/*/edit
// @exclude      http*://*mbsandbox.org/artist/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

// https://www.wikidata.org/wiki/Wikidata:List_of_properties/Person
const wikidata = {
    language: 'en',
    entities: {
        person: 5,
        stringQuartet: 207338,
        orchestra: 42998,
        band: 215380,
        rockBand: 5741069,
        male: 6581097,
        female: 6581072
    },
    fields: {
        type: 'P31',
        gender: 'P21',
        citizen: 'P27',
        coordinates: 'P625',
        country: 'P495',
        isni: 'P213',
        birthDate: 'P569',
        inceptionDate: 'P571',
        birthPlace: 'P19',
        formationLocation: 'P740',
        deathDate: 'P570',
        dissolutionDate: 'P576',
        deathPlace: 'P20',
        mbidArtist: 'P434',
        mbidArea: 'P982',
        members: 'P527',
        idDiscogs: 'P1953',
        idIMDB: 'P345',
        idSpotify: 'P1902',
        idOL: 'P648',
        idVIAF: 'P214',
        idGND: 'P227',
        idBNF: 'P268',
        idIMSLP: 'P839'
    },
    urls: {
        idDiscogs: 'http://www.discogs.com/artist/',
        idIMDB: 'http://www.imdb.com/name/',
        idSpotify: 'https://open.spotify.com/artist/',
        idOL: 'https://openlibrary.org/works/',
        idVIAF: 'https://viaf.org/viaf/',
        idGND: 'https://d-nb.info/gnd/',
        idIMSLP: 'https://imslp.org/wiki/',
        idBNF: 'http://catalogue.bnf.fr/ark:/12148/cb'
    }
};


const parseWD = function () {
    var self = {};

    self.existField = function (entity, field) {
        return entity.claims[wikidata.fields[field]] !== undefined;
    };

    self.valueFromField = function (entity, field) {
        return entity.claims[wikidata.fields[field]][0].mainsnak.datavalue.value;
    };

    self.setValue = function (nodeId, value, callback) {
        var node = document.getElementById(nodeId);
        if (!node.value.trim()) {  // field was empty
            node.value = value;
        } else if (node.value != value) {  // != to allow autocasting to int
            callback();
        }
    };

    self.fillArea = function (data, place, nodeId, lang) {
        var entityArea = data.entities[place],
            input = document.getElementById(`id-edit-artist.${nodeId}.name`);
        if (!entityArea) {
            return;
        }
        if (self.existField(entityArea, 'mbidArea')) {
            input.value = self.valueFromField(entityArea, 'mbidArea');
            $(input).trigger('keydown');
        } else {
            input.value = entityArea.labels[lang].value;
        }
    };

    self.fillDate = function (entity, entityType, fieldName, nodeId) {
        var field = self.valueFromField(entity, fieldName);
        var prefix = `id-edit-${entityType}.period.${nodeId}`;
        // sometimes wikidata has valid data but not 'translatable'
        // to the mbz schema
        // cf https://www.mediawiki.org/wiki/Wikibase/DataModel#Dates_and_times
        if (field.precision < 9 || field.before > 0 || field.after > 0) {
            return;
        }
        // sometimes wikidata has invalid data for months/days
        var date = new Date(field.time.slice(1)); // remove leading "+"
        if (isNaN(date.getTime())) { // invalid date
            // try to find valid fields
            date = new RegExp('(.*)-(.*)-(.*)T').exec(field.time);
            if (parseInt(date[1]) !== 0) {
                self.setValue(prefix + '.year', parseInt(date[1]));
                if (parseInt(date[2]) > 0) {
                    self.setValue(prefix + '.month', parseInt(date[2]));
                    if (parseInt(date[3]) > 0) {
                        self.setValue(prefix + '.day', parseInt(date[3]));
                    }
                }
            }
            return;
        }
        self.setValue(prefix + '.year', date.getFullYear());
        var yearInput = document.getElementById(prefix + '.year');
        if (yearInput.classList.contains('jesus2099')) {
                // jesus2099's EASY_DATE script is shifting the input node
                // containing the year but not its id
                yearInput.nextSibling.value = date.getFullYear();
        }
        if (field.precision > 9) {
            self.setValue(prefix + '.month', date.getMonth() + 1);
            if (field.precision > 10) {
                self.setValue(prefix + '.day', date.getDate());
            }
        }
    };

    self.request = function(wikiId, callback) {
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
            callback(data.entities[wikiId]);
        });
    };

    return self;
}();


function parseWikidata(entity) {
    var lang = wikidata.language,
        value;
    if (!(lang in entity.labels)) {
        lang = Object.keys(entity.labels)[0];
    }
    // name and sort name
    parseWD.setValue(
        'id-edit-artist.name',
        entity.labels[lang].value,
        function cb() {
            $(document.getElementById('id-edit-artist.name')).trigger('change');
            document.getElementsByClassName('guesscase-sortname')[0].click();
        }
    );


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
        parseWD.fillDate(entity, 'artist', field, 'begin_date');
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
        parseWD.fillDate(entity, 'artist', field, 'end_date');
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
    parseWD.request(wikiId, function (entity) {
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
    parseWD.setValue('id-edit-artist.edit_note', sidebar.editNote(GM_info.script));
}

(function displayToolbar(relEditor) {
    $('div.half-width').after(
        $('<div>', {float: 'right'})).after(
        relEditor.container()
        .append(
            $('<p>Add a wikidata/VIAF/BNF... link here to retrieve automatically some information</p>')
        ).append(
            $('<input>', {
                'id': 'linkParser',
                'type': 'text',
                'value': '',
                'placeholder': 'URL to parse',
                'width': '400px'
            })
        )
    );
    $('div#loujine-menu').css('margin-left', '550px');
})(relEditor);

$(document).ready(function() {
    var node = document.getElementById('linkParser');
    node.addEventListener('input', function () {
        if (node.value.split('/')[2] === "www.wikidata.org") {
            fillForm(node.value.split('/')[4].trim());
            node.value = '';
        }
    }, false);
    return false;
});

// test data:
// https://www.wikidata.org/wiki/Q11331342
// https://www.wikidata.org/wiki/Q1277689 invalid date with precision=10 (Y+M)
// https://www.wikidata.org/wiki/Q3290108 invalid date with precision=9 (year)
// https://www.wikidata.org/wiki/Q3193910 invalid date with precision=7
