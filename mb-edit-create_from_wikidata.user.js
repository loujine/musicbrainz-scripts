/* global $ helper relEditor sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Create entity or fill data from wikipedia / wikidata / VIAF / ISNI
// @namespace    mbz-loujine
// @author       loujine
// @version      2024.11.24
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_from_wikidata.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_from_wikidata.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org edit: Create entity or fill data from wikipedia / wikidata / VIAF / ISNI
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/create*
// @include      http*://*musicbrainz.org/artist/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/alias/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/credit/*/edit
// @include      http*://*musicbrainz.org/label/create*
// @include      http*://*musicbrainz.org/label/*/edit
// @exclude      http*://*musicbrainz.org/label/*/alias/*/edit
// @include      http*://*musicbrainz.org/place/create*
// @include      http*://*musicbrainz.org/place/*/edit
// @exclude      http*://*musicbrainz.org/place/*/alias/*/edit
// @include      http*://*musicbrainz.org/work/create*
// @include      http*://*musicbrainz.org/work/*/edit
// @exclude      http*://*musicbrainz.org/work/*/alias/*/edit
// @grant        GM_xmlhttpRequest
// @connect      wikipedia.org
// @connect      isni.org
// @connect      oclc.org
// @run-at       document-end
// ==/UserScript==

// https://www.wikidata.org/wiki/Wikidata:List_of_properties/Person
class WikiDataHelpers {

    constructor() {
        this.language = 'en';
        this.entities = {
            person: 5,
            stringQuartet: 207338,
            orchestra: 42998,
            band: 215380,
            rockBand: 5741069,
            male: 6581097,
            female: 6581072,
        };
        this.fields = {
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
            officialWebsite: 'P856',
            // authorities
            idVIAF: 'P214',
            idGND: 'P227',
            idLoC: 'P244',
            idWorldCat: 'P244',
            idBNF: 'P268',
            idTrove: 'P1315',
            // databases
            idIMDB: 'P345',
            idOL: 'P648',
            idIMSLP: 'P839',
            idIDBD: 'P1220',
            idAllMusic: 'P1728',
            idMetalArchivesBand: 'P1952',
            idDiscogs: 'P1953',
            idMetalArchivesArtist: 'P1989',
            idSecondHandSongs: 'P2909',
            idSNAC: 'P3430',
            idVGMDB: 'P3435',
            idOperabase: 'P4869',
            // social media
            idTwitter: 'P2002',
            idInstagram: 'P2003',
            idFacebook: 'P2013',
            idGenius: 'P2373',
            idGooglePlus: 'P2847',
            idMyspace: 'P3265',
            idWeibo: 'P3579',
            idPinterest: 'P3836',
            idThreads: 'P11892',
            // other
            idSpotify: 'P1902',
            idYoutube: 'P2397',
            idDeezer: 'P2722',
            idiTunes: 'P2850',
            idDailymotion: 'P2942',
            idSoundCloud: 'P3040',
            idLastFM: 'P3192',
            idSongkick: 'P3478',
            idVimeo: 'P4015',
            idPatreon: 'P4175',
            idAnghami: 'P10885',
            // missing: Tumblr (P3943), Bandcamp (P3283)
        };
        this.urls = {
            officialWebsite: '',
            // authorities
            idVIAF: 'https://viaf.org/viaf/',
            idGND: 'https://d-nb.info/gnd/',
            idLoC: 'https://id.loc.gov/authorities/names/',
            idWorldCat: 'https://www.worldcat.org/identities/lccn-',
            idBNF: 'http://catalogue.bnf.fr/ark:/12148/cb',
            idTrove: 'https://nla.gov.au/nla.party-',
            // databases
            idIMDB: 'https://www.imdb.com/name/',
            idOL: 'https://openlibrary.org/works/',
            idIMSLP: 'https://imslp.org/wiki/',
            idIDBD: 'https://ibdb.com/person.php?id=',
            idAllMusic: 'https://www.allmusic.com/artist/',
            idMetalArchivesBand: 'https://www.metal-archives.com/band.php?id=',
            idDiscogs: 'https://www.discogs.com/artist/',
            idMetalArchivesArtist: 'https://www.metal-archives.com/artist.php?id=',
            idGenius: 'https://genius.com/artists/',
            idSecondHandSongs: 'https://secondhandsongs.com/artist/',
            idVGMDB: 'https://vgmdb.net/artist/',
            idOperabase: 'http://operabase.com/artists/',
            idSNAC: 'http://snaccooperative.org/ark:/99166/',
            // social media
            idTwitter: 'https://twitter.com/',
            idInstagram: 'https://www.instagram.com/',
            idFacebook: 'https://www.facebook.com/',
            idGooglePlus: 'https://plus.google.com/u/0/',
            idMyspace: 'https://myspace.com/',
            idWeibo: 'https://weibo.com/',
            idPinterest: 'https://www.pinterest.com/',
            idThreads: 'https://www.threads.net/@',
            // other
            idSpotify: 'https://open.spotify.com/artist/',
            idYoutube: 'https://www.youtube.com/channel/',
            idDeezer: 'https://www.deezer.com/artist/',
            idiTunes: 'https://itunes.apple.com/artist/',
            idDailymotion: 'https://www.dailymotion.com/',
            idSoundCloud: 'https://soundcloud.com/',
            idLastFM: 'https://www.last.fm/music/',
            idSongkick: 'https://www.songkick.com/artists/',
            idVimeo: 'https://vimeo.com/',
            idPatreon: 'https://www.patreon.com/',
            idAnghami: 'https://play.anghami.com/artist/',
        };
    }

    existField(entity, field) {
        return entity.claims[this.fields[field]] !== undefined;
    }

    fieldValue(entity, field) {
        if (entity.claims[this.fields[field]][0].mainsnak.snaktype === 'value') {
            return entity.claims[this.fields[field]][0].mainsnak.datavalue.value;
        }
        // snaktype='somevalue' seems to mean ill-defined/undefined, do not parse
        return '';
    }

    /*
     * data: wikidata json for the area
     * place: wikidata code ('Q90', etc.)
     */
    _fillArea(data, place, nodeId, lang) {
        const entityArea = data.entities[place];
        const input = document.getElementById(`id-edit-artist.${nodeId}.name`);
        if (!entityArea || !input) { // no wikidata data
            return;
        }
        const area = entityArea.labels[lang].value;
        $('#newFields').append(
            $('<dt>', {'text': `Field "${FIELD_NAMES[nodeId]}":`})
        );
        if (input.value === area) {
            $('#newFields').append(
                $('<dd>', {'text': `Kept "${input.value}"`})
            );
            return;
        }
        if (input.value !== '' && input.value !== area) {
            $('#newFields').append(
                $('<dd>',
                  {'text': `Different value "${area}":`}).css('color', 'red')
            )
            return;
        }
        if (this.existField(entityArea, 'mbidArea')) {
            input.value = this.fieldValue(entityArea, 'mbidArea');
            input.dispatchEvent(new Event('input'));
            $('#area-bubble').remove();
        } else {
            input.value = area;
        }
        $('#newFields').append(
            $('<dd>', {'text': `Added "${area}"`}).css('color', 'green')
        );
    }

    fillArea(entity, field, areaField, lang) {
        let area = 'Q' + this.fieldValue(entity, field)['numeric-id'];
        if (area === 'Q29999') {
            // Kingdom of Netherlands
            area = 'Q55'; // Netherlands
        }
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + area + '&format=json',
            dataType: 'jsonp'
        }).done(data => this._fillArea(data, area, areaField, lang));
    }

    fillDate(entity, entityType, fieldName, nodeId) {
        const field = this.fieldValue(entity, fieldName);
        const prefix = `id-edit-${entityType}.period.${nodeId}`;
        if (!field) {
            return;
        }
        // sometimes wikidata has valid data but not 'translatable'
        // to the mbz schema
        // cf https://www.mediawiki.org/wiki/Wikibase/DataModel#Dates_and_times
        if (field.precision < 9 || field.before > 0 || field.after > 0) {
            return;
        }
        // sometimes wikidata has invalid data for months/days
        let date = new Date(field.time.slice(1)); // remove leading "+"
        if (isNaN(date.getTime())) {
            // invalid date
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
        const yearInput = document.getElementById(prefix + '.year');
        if (!yearInput) {
            return;
        }
        if (yearInput.classList.contains('jesus2099')) {
            // jesus2099's EASY_DATE script is shifting the input node
            // containing the year but not its id
            yearInput.nextSibling.value = date.getUTCFullYear();
        }
        if (field.precision > 9) {
            setValue(prefix + '.month', date.getUTCMonth() + 1);
            if (field.precision > 10) {
                setValue(prefix + '.day', date.getUTCDate());
            }
        }
    }

    request(wikiId, callback) {
        $.ajax({
            url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='
                 + wikiId + '&format=json',
            dataType: 'jsonp'
        }).done(data => {
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
    }
}

const libWD = new WikiDataHelpers();


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

for (const [key, value] of Object.entries(FIELD_NAMES)) {
    if (key.includes('artist')) {
        FIELD_NAMES[key.replace('artist', 'place')] = value;
        FIELD_NAMES[key.replace('artist', 'work')] = value;
        FIELD_NAMES[key.replace('artist', 'label')] = value;
    }
}


function setValue(nodeId, value, callback) {
    callback = callback || (() => {});
    const node = document.getElementById(nodeId);
    if (!node) {
        return false;
    }
    $('#newFields').append(
        $('<dt>', {'text': `Field "${FIELD_NAMES[nodeId]}":`})
    );
    const printableValue = node.options ? node.options[value].text : value;
    if (!node.value.trim()) {
        // field was empty
        node.value = value;
        node.dispatchEvent(new Event('change'));
        $('#newFields').append(
            $('<dd>',
              {'text': `Added "${printableValue}"`}).css('color', 'green')
        );
        return callback(); // eslint-disable-line consistent-return
    }
    if (node.value != value) { // != to allow autocasting to int
        $('#newFields').append(
            $('<dd>', {'text': `Different value "${printableValue}" suggested`}
            ).css('color', 'red')
        );
        return callback(); // eslint-disable-line consistent-return
    }
    // identical value, not replaced
    $('#newFields').append(
        $('<dd>', {'text': `Kept "${printableValue}"`})
    );
    return false;
}


function fillISNI(isni) {
    const existing_isni = [];
    const isniBlock = document.getElementById(
        'add-isni-code').parentElement.parentElement;
    const fields = isniBlock.getElementsByTagName('input');
    for (const input of fields) {
        existing_isni.push(input.value.split(' ').join(''));
    }
    existing_isni.splice(0, 1); // skip template
    if (existing_isni.includes(isni.split(' ').join(''))) {
        return;
    }
    if (existing_isni.length === 1 && existing_isni[0] === '') {
        document.getElementsByName('edit-artist.isni_codes.0')[0].value = isni;
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


function _existingDomains() {
    const existingDomains = [];
    const fields = document.getElementById("external-links-editor")
                           .querySelectorAll('a.url');
    for (const link of fields) {
        existingDomains.push(link.href.split('/')[2]);
    }
    return existingDomains;
}


function _fillExternalLinks(url) {

    /* React16 adapter
     *
     * from https://github.com/facebook/react/issues/10135#issuecomment-314441175
     * React considers DOM events as duplicate of synthetic events
     */

    function _setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }
    }
    const fields = document.querySelectorAll('#external-links-editor input[type="url"]');
    const input = fields[fields.length - 1];
    _setNativeValue(input, url);
    input.dispatchEvent(new Event('input', {'bubbles': true}));
    $('#newFields').append(
        $('<dt>', {'text': 'New external link added:'})
    ).append(
        $('<dd>', {'text': url}).css('color', 'green')
    );
}


function fillExternalLinks(url) {
    const existingDomains = _existingDomains();
    const domain = url.split('/')[2];
    if (!existingDomains.includes(domain)) {
        _fillExternalLinks(url);
    }
}


function _fillEntityName(value, entityType) {
    function callback() {
        if (helper.isArtistURL()) {
            if (!document.getElementById('id-edit-artist.sort_name')
                         .value.length) {
                $('#newFields').append(
                    $('<p>',
                      {'text': 'You must set the sort name to '
                               + 'save the edit'}).css('color', 'red')
                );
            }
        }
    }
    setValue(`id-edit-${entityType}.name`, value, callback);
}

function _fillEntityType(entity, entityType) {
    let value;
    const type = libWD.fieldValue(entity, 'type')['numeric-id'];
    switch (type) {
        case libWD.entities.person:
            value = 1;
            break;
        case libWD.entities.stringQuartet:
        case libWD.entities.orchestra:
        case libWD.entities.band:
        case libWD.entities.rockBand:
            value = 2;
            break;
        default:
            value = 0;
            break;
    }
    setValue(`id-edit-${entityType}.type_id`, value);
}

function _fillEntityGender(entity) {
    let value;
    const gender = libWD.fieldValue(entity, 'gender')['numeric-id'];
    switch (gender) {
        case libWD.entities.male:
            value = 1;
            break;
        case libWD.entities.female:
            value = 2;
            break;
        default:
            value = 3;
            break;
    }
    setValue('id-edit-artist.gender_id', value);
}


// eslint-disable-next-line complexity
function _fillFormFromWikidata(entity, entityType) {
    let lang = libWD.language;
    let field;
    let input;
    if (!(lang in entity.labels)) {
        lang = Object.keys(entity.labels)[0];
    }

    // name and sort name
    _fillEntityName(entity.labels[lang].value, entityType);

    // for places: Coordinates
    if (libWD.existField(entity, 'coordinates')) {
        input = document.getElementById('id-edit-place.coordinates');
        const coord = libWD.fieldValue(entity, 'coordinates');
        input.value = coord.latitude + ', ' + coord.longitude;
    }

    // Type and gender
    if (libWD.existField(entity, 'type')) {
        _fillEntityType(entity, entityType);
    }

    if (libWD.existField(entity, 'gender')) {
        _fillEntityGender(entity);
    }

    // Area
    // we need to fetch the wikidata entry of the different areas to
    // check if a musicbrainz MBID already exists
    if (
        libWD.existField(entity, 'citizen') ||
        libWD.existField(entity, 'country')
    ) {
        field = libWD.existField(entity, 'citizen') ? 'citizen' : 'country';
        libWD.fillArea(entity, field, 'area', lang);
    }

    // ISNI
    if (entityType === 'artist' && libWD.existField(entity, 'isni')) {
        fillISNI(libWD.fieldValue(entity, 'isni'));
    }

    // Dates & places
    if (
        libWD.existField(entity, 'birthDate') ||
        libWD.existField(entity, 'inceptionDate')
    ) {
        field = libWD.existField(entity, 'birthDate')
            ? 'birthDate'
            : 'inceptionDate';
        libWD.fillDate(entity, entityType, field, 'begin_date');
    }

    if (
        libWD.existField(entity, 'birthPlace') ||
        libWD.existField(entity, 'formationLocation')
    ) {
        field = libWD.existField(entity, 'birthPlace')
            ? 'birthPlace'
            : 'formationLocation';
        libWD.fillArea(entity, field, 'begin_area', lang);
    }

    if (
        libWD.existField(entity, 'deathDate') ||
        libWD.existField(entity, 'dissolutionDate')
    ) {
        field = libWD.existField(entity, 'deathDate')
            ? 'deathDate'
            : 'dissolutionDate';
        libWD.fillDate(entity, entityType, field, 'end_date');
    }

    if (libWD.existField(entity, 'deathPlace')) {
        libWD.fillArea(entity, 'deathPlace', 'end_area', lang);
    }

    const existingDomains = _existingDomains();
    for (const [externalLink, url] of Object.entries(libWD.urls)) {
        const domain = url.split('/')[2];
        if (!libWD.existField(entity, externalLink)) {
            continue;
        }
        const fullUrl = url + libWD.fieldValue(entity, externalLink);
        if (
            (domain && !existingDomains.includes(domain)) ||
            // official website
            (!domain && !existingDomains.includes(fullUrl.split('/')[2]))
        ) {
            _fillExternalLinks(fullUrl);
        }
    }

    for (const role of ['student', 'teacher']) {
        if (libWD.existField(entity, role)) {
            libWD.request(libWD.fieldValue(entity, role).id, data => {
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
    libWD.request(wikiId, entity => {
        if (
            document.URL.split('/')[4] == 'create' &&
            (libWD.existField(entity, 'mbidArtist') ||
                libWD.existField(entity, 'mbidPlace'))
        ) {
            const mbid = libWD.existField(entity, 'mbidArtist')
                ? libWD.fieldValue(entity, 'mbidArtist')
                : libWD.fieldValue(entity, 'mbidPlace');
            // eslint-disable-next-line no-alert
            if (window.confirm(
                    'An entity already exists linked to this wikidata id, ' +
                    'click "ok" to redirect to their page')) {
                window.location.href = `/${entityType}/${mbid}`;
            }
        }
        _fillFormFromWikidata(entity, entityType);
    });
    document.getElementById(
        `id-edit-${entityType}.edit_note`
    ).value += sidebar.editNote(GM_info.script);
}


function fillFormFromVIAF(viafURL) {
    const entityType = document.URL.split('/')[3];
    fetch(viafURL).then(resp => resp.text()).then(html => {
        fillExternalLinks(viafURL);
        const doc = new DOMParser().parseFromString(html, 'text/xml');
        _fillEntityName(doc.getElementsByTagName('h2')[1].textContent, entityType);
        for (const site of ["catalogue.bnf.fr", "d-nb.info", "wikidata.org", "id.loc.gov"]) {
            const link = doc.querySelector(`a[href*="${site}"]`);
            if (link && link.href) {
                fillExternalLinks(link.href);
            }
        }
        const link = doc.querySelector(`a[href*="isni.org"]`);
        if (link && link.href) {
            fillISNI(link.href.split('/')[4]);
        }
        document.getElementById(`id-edit-${entityType}.edit_note`)
                .value += sidebar.editNote(GM_info.script);
    });
}


function fillFormFromISNI(isniURL) {
    const entityType = document.URL.split('/')[3];
    GM_xmlhttpRequest({
        method: 'GET',
        url: isniURL,
        timeout: 5000,
        ontimeout: () => {
            $('#newFields').append(
                $('<p>',
                  {'text': 'The request to ISNI website timed out'}).css('color', 'red')
            );
        },
        onload: resp => {
            fillISNI(isniURL.split('/')[3]);
            let rgx = new RegExp(`href="(.*?musicbrainz.org.*?)"`).exec(resp.responseText);
            if (rgx.length) {
                // eslint-disable-next-line no-alert
                if (window.confirm(
                        'An entity already exists linked to this ISNI id, ' +
                        'click "ok" to redirect to their page')) {
                    window.location.href = rgx[1];
                }
            }

            for (const site of [
                'catalogue.bnf.fr', 'd-nb.info', 'wikidata.org', 'id.loc.gov', 'viaf.org'
            ]) {
                rgx = new RegExp(`href="(.*?${site}.*?)"`).exec(resp.responseText);
                if (rgx.length) {
                    fillExternalLinks(rgx[1]);
                }
            }

            rgx = new RegExp(
                /Name:.*?<psi:text>(.*?)<\/psi:text>/
            ).exec(resp.responseText.replace(/\n/g, ''));
            if (rgx.length) {
                _fillEntityName(rgx[1], entityType);
            }
        },
    });
}


(function displayToolbar() {
    if (!helper.isUserLoggedIn()) {
        return false;
    }
    document.getElementsByClassName('half-width')[0].insertAdjacentHTML(
        'afterend', '<div id="side-col" style="float: right;"></div>');
    relEditor.container(document.getElementById('side-col')).insertAdjacentHTML(
        'beforeend', `
        <h3>Add external link</h3>
        <p>Add a wkipedia/wikidata/VIAF/ISNI link here
           to retrieve automatically some information.</p>
        <input type="text" id="linkParser" value="" placeholder="paste URL here"
               style="width: 400px;">
        <dl id="newFields">
    `);
    document.getElementById('loujine-menu').style.marginLeft = '550px';
})();

$(document).ready(function () {
    if (!helper.isUserLoggedIn()) {
        return false;
    }
    const node = document.getElementById('linkParser');
    node.addEventListener('input', () => {
        node.value = node.value.trim();
        if (!node.value) {
            return;
        }
        const domain = node.value.split('/')[2];
        node.style.backgroundColor = '#bbffbb';
        if (domain === "www.wikidata.org") {
            fillExternalLinks(node.value);
            fillFormFromWikidata(node.value.match(/\/(Q\d+)\b/)[1]);
        } else if (domain.includes("wikipedia.org")) {
            GM_xmlhttpRequest({
                method: "GET",
                url: node.value,
                timeout: 1000,
                onload: function(resp) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(resp.responseText, 'text/html');
                    const link = doc.querySelector('#p-tb a[href*="www.wikidata.org"]');
                    fillExternalLinks(link.href);
                    fillFormFromWikidata(link.href.match(/\/(Q\d+)\b/)[1]);
                }
            });
        } else if (domain === "viaf.org") {
            node.value = node.value.replace(/http:/g, 'https:');
            if (!node.value.endsWith('/')) {
                node.value += '/';
            }
            fillFormFromVIAF(node.value);
        } else if (domain.includes("isni.org")) {
            node.value = node.value.replace(/http:/g, 'https:');
            node.value = node.value.replace(/isni\//g, '');
            fillFormFromISNI(node.value);
        } else {
            node.style.backgroundColor = '#ffaaaa';
        }
    }, false);
    return false;
});

// test data:
// https://www.wikidata.org/wiki/Q11331342
// https://www.wikidata.org/wiki/Special:EntityPage/Q5383 wikipedia link
// https://www.wikidata.org/wiki/Q1277689 invalid date with precision=10 (Y+M)
// https://www.wikidata.org/wiki/Q3290108 invalid date with precision=9 (year)
// https://www.wikidata.org/wiki/Q3193910 invalid date with precision=7
// https://www.wikidata.org/wiki/Q732552  unknown value date of birth

// import viaf
// https://viaf.org/viaf/44485204/
// https://viaf.org/viaf/80111787/
// https://viaf.org/viaf/176025900/ work

// bnf
// http://catalogue.bnf.fr/ark:/12148/cb13894801b.unimarc
//  103 .. $a 19161019 19851014


// test data for places:
// https://www.wikidata.org/wiki/Q2303621

// test data for works:
// https://www.wikidata.org/wiki/Q31745949

// isni
// http://www.isni.org/isni/0000000073684002 person
// http://www.isni.org/0000000120191498 orchestra
