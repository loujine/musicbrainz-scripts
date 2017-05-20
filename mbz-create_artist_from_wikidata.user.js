/* global $ _ helper relEditor sidebar GM_info requests */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Fill entity info from wikidata/VIAF
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.5.20
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-create_artist_from_wikidata.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Fill entity info from wikidata/VIAF
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/artist/create*
// @include      http*://*musicbrainz.org/artist/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/alias/*/edit
// @include      http*://*mbsandbox.org/artist/create*
// @include      http*://*mbsandbox.org/artist/*/edit
// @exclude      http*://*mbsandbox.org/artist/*/alias/*/edit
// @include      http*://*musicbrainz.org/place/create*
// @include      http*://*musicbrainz.org/place/*/edit
// @exclude      http*://*musicbrainz.org/place/*/alias/*/edit
// @include      http*://*mbsandbox.org/place/create*
// @include      http*://*mbsandbox.org/place/*/edit
// @exclude      http*://*mbsandbox.org/place/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

// https://www.wikidata.org/wiki/Wikidata:List_of_properties/Person
const WIKIDATA = {
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
        mbidPlace: 'P1004',
        members: 'P527',
        student: 'P802',
        teacher: 'P1066',
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


const FIELD_NAMES = {
    'id-edit-artist.name': 'Name',
    'id-edit-artist.type_id': 'Type',
    'id-edit-artist.gender_id': 'Gender',
    'id-edit-artist.period.begin_date.year': 'Birth year',
    'id-edit-artist.period.begin_date.month': 'Birth month',
    'id-edit-artist.period.begin_date.day': 'Birth day',
    'id-edit-artist.period.end_date.year': 'Death year',
    'id-edit-artist.period.end_date.month': 'Death month',
    'id-edit-artist.period.end_date.day': 'Death day',
    'begin_area': 'Born in',
    'end_area': 'Died in',
    'area': 'Area',
};

_.forOwn(FIELD_NAMES, function (v, k) {
    if (k.includes('artist')) {
        FIELD_NAMES[k.replace('artist', 'place')] = v;
    }
});


function setValue (nodeId, value, callback) {
    callback = callback || function () {};
    var node = document.getElementById(nodeId);
    $('#newFields').append(
        $('<dt>', {'text': `Field "${FIELD_NAMES[nodeId]}":`})
    )
    var printableValue = node.options ? node.options[value].text : value;
    if (!node.value.trim()) {  // field was empty
        node.value = value;
        $('#newFields').append(
            $('<dd>',
              {'text': `Added "${printableValue}"`}).css('color', 'green')
        );
        return callback();
    }
    if (node.value != value) {  // != to allow autocasting to int
        $('#newFields').append(
            $('<dd>',
              {'text': `Different value "${printableValue} suggested`}
            ).css('color', 'red')
        );
        return callback();
    }
    // identical value, not replaced
    $('#newFields').append(
        $('<dd>', {'text': `Kept "${printableValue}"`})
    );
    return false;
}


function fillISNI(isni) {
    const existing_isni = [],
          isniBlock = document.getElementsByClassName(
            'edit-artist.isni_codes-template')[0].parentElement,
        fields = isniBlock.getElementsByTagName('input');
    for (const input of fields) {
        existing_isni.push(input.value.split(" ").join(""));
    }
    existing_isni.splice(0, 1); // skip template
    if (_.contains(existing_isni, isni.split(" ").join(""))) {
        return;
    }
    if (existing_isni.length === 1 && existing_isni[0] === "") {
        document.getElementsByName('edit-artist.isni_codes.0')[0]
                .value = isni;
    } else {
        isniBlock.getElementsByClassName('form-row-add')[0]
                 .getElementsByTagName('button')[0].click();
        document.getElementsByName(
            `edit-artist.isni_codes.${existing_isni.length}`)[0].value = isni;
    }
    $('#newFields').append(
        $('<dt>', {'text': 'New ISNI code added:'})
    ).append(
        $('<dd>', {'text': isni}).css('color', 'green')
    );
}


function fillExternalLinks(url) {
    function _addExternalLink(url) {
        const inputs = document.getElementById('external-links-editor')
                               .getElementsByTagName('input'),
            input = inputs[inputs.length - 1];
        input.value = url;
        input.dispatchEvent(new Event('input', {'bubbles': true}));
    }
    let existing_domains = [];
    for (const input of document.getElementById("external-links-editor")
                                .querySelectorAll('input')) {
        existing_domains.push(input.value.split('/')[2]);
    }
    existing_domains = existing_domains.slice(0, existing_domains.length - 1);
    const domain = url.split('/')[2];
    if (!_.includes(existing_domains, domain)) {
        _addExternalLink(url);
        $('#newFields').append(
            $('<dt>', {'text': 'New external link added:'})
        ).append(
            $('<dd>', {'text': url}).css('color', 'green')
        );
    }
}


const libWD = function () {
    var self = {};

    self.existField = function (entity, field) {
        return entity.claims[WIKIDATA.fields[field]] !== undefined;
    };

    self.fieldValue = function (entity, field) {
        return entity.claims[WIKIDATA.fields[field]][0]
                     .mainsnak.datavalue.value;
    };

    /*
     * data: wikidata json for the area
     * place: wikidata code ('Q90', etc.)
     */
    self.fillArea = function (data, place, nodeId, lang) {
        var entityArea = data.entities[place],
            input = document.getElementById(`id-edit-artist.${nodeId}.name`);
        if (!entityArea) {  // no wikidata data
            return;
        }
        var area = entityArea.labels[lang].value;
        $('#newFields').append(
            $('<dt>', {'text': `Field "${FIELD_NAMES[nodeId]}":`})
        )
        if (input.value === area) {
            $('#newFields').append(
                $('<dd>', {'text': `Kept "${input.value}":`})
            )
            return;
        }
        if (input.value !== '' && input.value !== area) {
            $('#newFields').append(
                $('<dd>',
                  {'text': `Different value "${area}":`}).css('color', 'red')
            )
            return;
        }
        if (self.existField(entityArea, 'mbidArea')) {
            input.value = self.fieldValue(entityArea, 'mbidArea');
            $(input).trigger('keydown');
        } else {
            input.value = area;
        }
        $('#newFields').append(
            $('<dd>', {'text': `Added "${area}":`}).css('color', 'green')
        )
    };

    self.fillDate = function (entity, entityType, fieldName, nodeId) {
        var field = self.fieldValue(entity, fieldName);
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
                setValue(prefix + '.year', parseInt(date[1]));
                if (parseInt(date[2]) > 0) {
                    setValue(prefix + '.month', parseInt(date[2]));
                    if (parseInt(date[3]) > 0) {
                        setValue(prefix + '.day', parseInt(date[3]));
                    }
                }
            }
            return;
        }
        setValue(prefix + '.year', date.getFullYear());
        var yearInput = document.getElementById(prefix + '.year');
        if (yearInput.classList.contains('jesus2099')) {
                // jesus2099's EASY_DATE script is shifting the input node
                // containing the year but not its id
                yearInput.nextSibling.value = date.getFullYear();
        }
        if (field.precision > 9) {
            setValue(prefix + '.month', date.getMonth() + 1);
            if (field.precision > 10) {
                setValue(prefix + '.day', date.getDate());
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
                // eslint-disable-next-line no-alert
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


function _fillFormFromWikidata(entity, entityType) {
    var lang = WIKIDATA.language,
        value, field, fields, input;
    if (!(lang in entity.labels)) {
        lang = Object.keys(entity.labels)[0];
    }

    // name and sort name
    setValue(
        `id-edit-${entityType}.name`,
        entity.labels[lang].value,
        function cb() {
            if (helper.isArtistURL) {
                $(document.getElementById('id-edit-artist.name')
                    ).trigger('change');
                document.getElementsByClassName(
                    'guesscase-sortname')[0].click();
            }
        }
    );

    // for places: Coordinates
    if (libWD.existField(entity, 'coordinates')) {
        input = document.getElementById('id-edit-place.coordinates');
        const coord = libWD.fieldValue(entity, 'coordinates');
        input.value = coord.latitude + ', ' + coord.longitude;
    }

    // Type and gender
    if (libWD.existField(entity, 'type')) {
        var type = libWD.fieldValue(entity, 'type')['numeric-id'];
        switch(type) {
            case WIKIDATA.entities.person:
                value = 1;
                break;
            case WIKIDATA.entities.stringQuartet:
            case WIKIDATA.entities.orchestra:
            case WIKIDATA.entities.band:
            case WIKIDATA.entities.rockBand:
                value = 2;
                break;
            default:
                value = 0;
                break;
        }
        setValue(`id-edit-${entityType}.type_id`, value);
    }

    if (libWD.existField(entity, 'gender')) {
        var gender = libWD.fieldValue(entity, 'gender')['numeric-id'];
        switch(gender) {
            case WIKIDATA.entities.male:
                value = 1;
                break;
            case WIKIDATA.entities.female:
                value = 2;
                break;
            default:
                value = 3;
                break;
        }
        setValue('id-edit-artist.gender_id', value);
    }

    // Area
    // we need to fetch the wikidata entry of the different areas to
    // check if a musicbrainz MBID already exists
    if (libWD.existField(entity, 'citizen')
            || libWD.existField(entity, 'country')) {
        field = libWD.existField(entity, 'citizen') ? 'citizen' : 'country';
        var area = 'Q' + libWD.fieldValue(entity, field)['numeric-id'];
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + area + '&format=json',
            dataType: 'jsonp'
        }).done(function(data) {libWD.fillArea(data, area, 'area', lang)});
    }

    // ISNI
    if (entityType === 'artist' && libWD.existField(entity, 'isni')) {
        fillISNI(libWD.fieldValue(entity, 'isni'));
    }

    // Dates & places
    if (libWD.existField(entity, 'birthDate')
            || libWD.existField(entity, 'inceptionDate')) {
        field = libWD.existField(entity, 'birthDate') ? 'birthDate'
                                                      : 'inceptionDate';
        libWD.fillDate(entity, entityType, field, 'begin_date');
    }

    if (libWD.existField(entity, 'birthPlace')
            || libWD.existField(entity, 'formationLocation')) {
        field = libWD.existField(entity, 'birthPlace') ? 'birthPlace'
                                                       : 'formationLocation';
        var birthArea = 'Q' + libWD.fieldValue(entity, field)['numeric-id'];
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + birthArea + '&format=json',
            dataType: 'jsonp'
        }).done(function(data) {
            libWD.fillArea(data, birthArea, 'begin_area', lang)
        });
    }

    if (libWD.existField(entity, 'deathDate')
            || libWD.existField(entity, 'dissolutionDate')) {
        field = libWD.existField(entity, 'deathDate') ? 'deathDate'
                                                      : 'dissolutionDate';
        libWD.fillDate(entity, entityType, field, 'end_date');
    }

    if (libWD.existField(entity, 'deathPlace')) {
        var deathArea = 'Q' + libWD.fieldValue(entity,
                                               'deathPlace')['numeric-id'];
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + deathArea + '&format=json',
            dataType: 'jsonp'
        }).done(function(data) {
            libWD.fillArea(data, deathArea, 'end_area', lang)
        });
    }

    var existing_domains = [];
    fields = document.getElementById("external-links-editor")
                     .querySelectorAll('input');
    for (var link of fields) {
        existing_domains.push(link.value.split('/')[2]);
    }
    existing_domains = existing_domains.slice(0, existing_domains.length - 1);

    Object.keys(WIKIDATA.urls).forEach(function(externalLink) {
        var domain = WIKIDATA.urls[externalLink].split('/')[2];
        if (libWD.existField(entity, externalLink) &&
            !_.includes(existing_domains, domain)) {
            var inputs = document.getElementById('external-links-editor')
                         .getElementsByTagName('input');
            input = inputs[inputs.length - 1];
            input.value = WIKIDATA.urls[externalLink]
                          + libWD.fieldValue(entity, externalLink);
            input.dispatchEvent(new Event('input', {'bubbles': true}));
            $('#newFields').append(
                $('<dt>', {'text': 'New external link added:'})
            ).append(
                $('<dd>', {'text': input.value}).css('color', 'green')
            );
        }
    });

    for (const role of ['student', 'teacher']) {
        if (libWD.existField(entity, role)) {
            libWD.request(libWD.fieldValue(entity, role).id,
                          function (data) {
                const name = data.labels[lang].value;
                $('#newFields').append(
                    $('<dt>', {'text': `${role} suggestion:`})
                ).append(
                    $('<dd>', {'text': name}).css('color', 'orange')
                );
            });
        }
    }
}

function fillFormFromWikidata(wikiId) {
    const entityType = document.URL.split('/')[3];
    libWD.request(wikiId, function (entity) {
        if (libWD.existField(entity, 'mbidArtist')
                || libWD.existField(entity, 'mbidPlace')) {
            const mbid = libWD.existField(entity, 'mbidArtist') ?
                libWD.fieldValue(entity, 'mbidArtist') :
                libWD.fieldValue(entity, 'mbidPlace');
            // eslint-disable-next-line no-alert
            if (window.confirm(
                    'An entity already exists linked to this wikidata id, ' +
                    'click "ok" to redirect to their page')) {
                window.location.href = `/${entityType}/${mbid}`;
            }
        }
        _fillFormFromWikidata(entity, entityType);
    });
    document.getElementById(`id-edit-${entityType}.edit_note`)
            .value = sidebar.editNote(GM_info.script);
}


function fillFormFromVIAF(viafURL) {
    const entityType = document.URL.split('/')[3];
    requests.GET(viafURL, function (resp) {
        fillExternalLinks(viafURL);
        const parser = new DOMParser();
        const doc = parser.parseFromString(resp, 'text/html');
        setValue(
            'id-edit-artist.name',
            doc.getElementsByTagName('h2')[1].textContent,
            function cb() {
                $(document.getElementById(
                    'id-edit-artist.name')).trigger('change');
                document.getElementsByClassName(
                    'guesscase-sortname')[0].click();
            }
        );
        ["catalogue.bnf.fr", "d-nb.info", "wikidata.org"].forEach(
                function (site) {
            const link = doc.querySelector(`a[href*="${site}"]`);
            if (link && link.href) {
                fillExternalLinks(link.href);
            }
        });
        const link = doc.querySelector(`a[href*="isni.org"]`);
        if (link && link.href) {
            fillISNI(link.href.split('/')[4]);
        }
    document.getElementById(`id-edit-${entityType}.edit_note`)
            .value = sidebar.editNote(GM_info.script);
    })
}


(function displayToolbar(relEditor) {
    $('div.half-width').after(
        $('<div>', {float: 'right'})).after(
        relEditor.container()
        .append(
            $('<p>Add a wikidata/VIAF/BNF... ' +
              'link here to retrieve automatically some information</p>')
        ).append(
            $('<input>', {
                'id': 'linkParser',
                'type': 'text',
                'value': '',
                'placeholder': 'URL to parse',
                'width': '400px'
            })
        ).append(
            $('<dl>', {'id': 'newFields'})
        )
    );
    $('div#loujine-menu').css('margin-left', '550px');
})(relEditor);

$(document).ready(function() {
    var node = document.getElementById('linkParser');
    node.addEventListener('input', function () {
        if (node.value.split('/')[2] === "www.wikidata.org") {
            $('#linkParser').css('background-color', '#bbffbb');
            fillExternalLinks(node.value);
            fillFormFromWikidata(node.value.split('/')[4].trim());
        } else if (node.value.split('/')[2] === "viaf.org") {
            node.value = node.value.replace(/http:/g, 'https:')
            if (!node.value.endsWith('/')) {
                node.value = node.value + '/';
            }
            $('#linkParser').css('background-color', '#bbffbb');
            fillFormFromVIAF(node.value);
        } else {
            $('#linkParser').css('background-color', '#ffaaaa');
        }
    }, false);
    return false;
});

// test data:
// https://www.wikidata.org/wiki/Q11331342
// https://www.wikidata.org/wiki/Q1277689 invalid date with precision=10 (Y+M)
// https://www.wikidata.org/wiki/Q3290108 invalid date with precision=9 (year)
// https://www.wikidata.org/wiki/Q3193910 invalid date with precision=7

// import viaf
// https://viaf.org/viaf/44485204/
// https://viaf.org/viaf/80111787/

// bnf
// http://catalogue.bnf.fr/ark:/12148/cb13894801b.unimarc
//  103 .. $a 19161019 19851014

// test data for places:
// https://www.wikidata.org/wiki/Q2303621
