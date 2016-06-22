/* global $ _ MB */
'use strict';
// ==UserScript==
// @name         mbz-loujine-common
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.6.22
// @description  musicbrainz.org: common functions
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

// bitbucket repo info
var wikiUrl = 'https://bitbucket.org/loujine/musicbrainz-scripts/wiki/documentation.rst';

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var server = {
    'recordingLinkType': {
        'instrument': 148,
        'vocals': 149,
        'orchestra': 150,
        'conductor': 151,
        'chorusmaster': 152,
        'concertmaster': 760,
        'performer': 156,
        'work': 278,
        'place': 693,
        'area': 698
    },
    'releaseLinkTypeID': {
        44: 'instrument',
        60: 'vocals',
        45: 'orchestra',
        46: 'conductor',
        53: 'chorusmaster',
        51: 'performer',
    },
    'releaseToRecordingLink': function (linkTypeID) {
        return server.recordingLinkType[server.releaseLinkTypeID[linkTypeID]];
    },
    '_performingRoles': [
        'instrument',
        'vocals',
        'orchestra',
        'conductor',
        'chorusmaster',
        'performer',
    ],
    'performingLinkTypes': function () {
        return _.values(_.pick(server.recordingLinkType, server._performingRoles));
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
    // we wait for 'server.timeout' milliseconds between two queries
    'timeout': 1000
};

var works = {
    'type': '<select class="setwork">' +
'<option selected> </option>' +
'<option value="17">Song</option>' +
'<option value="1">Aria</option>' +
'<option value="25">Audio drama</option>' +
'<option value="2">Ballet</option>' +
'<option value="26">Beijing opera</option>' +
'<option value="3">Cantata</option>' +
'<option value="4">Concerto</option>' +
'<option value="20">Étude</option>' +
'<option value="30">Incidental music</option>' +
'<option value="7">Madrigal</option>' +
'<option value="8">Mass</option>' +
'<option value="9">Motet</option>' +
'<option value="29">Musical</option>' +
'<option value="10">Opera</option>' +
'<option value="24">Operetta</option>' +
'<option value="11">Oratorio</option>' +
'<option value="12">Overture</option>' +
'<option value="13">Partita</option>' +
'<option value="28">Play</option>' +
'<option value="21">Poem</option>' +
'<option value="23">Prose</option>' +
'<option value="14">Quartet</option>' +
'<option value="5">Sonata</option>' +
'<option value="15">Song-cycle</option>' +
'<option value="22">Soundtrack</option>' +
'<option value="6">Suite</option>' +
'<option value="18">Symphonic poem</option>' +
'<option value="16">Symphony</option>' +
'<option value="19">Zarzuela</option>' +
'</select>',
    'lang': '<select class="setlang">' +
'<option> </option>' +
'<optgroup label="Frequently used">' +
'<option class="language" value="284">[Multiple languages]</option>' +
'<option class="language" value="486" selected="selected">[No lyrics]</option>' +
'<option class="language" value="18">Arabic</option>' +
'<option class="language" value="76">Chinese</option>' +
'<option class="language" value="98">Czech</option>' +
'<option class="language" value="100">Danish</option>' +
'<option class="language" value="113">Dutch</option>' +
'<option class="language" value="120">English</option>' +
'<option class="language" value="131">Finnish</option>' +
'<option class="language" value="134">French</option>' +
'<option class="language" value="145">German</option>' +
'<option class="language" value="159">Greek</option>' +
'<option class="language" value="195">Italian</option>' +
'<option class="language" value="198">Japanese</option>' +
'<option class="language" value="224">Korean</option>' +
'<option class="language" value="338">Polish</option>' +
'<option class="language" value="340">Portuguese</option>' +
'<option class="language" value="353">Russian</option>' +
'<option class="language" value="393">Spanish</option>' +
'<option class="language" value="403">Swedish</option>' +
'<option class="language" value="433">Turkish</option>' +
'</optgroup>' +
'</select>',
    'key': '<select class="setkey">' +
'<option selected> </option>' +
'<option value="2">C major</option>' +
'<option value="3">C minor</option>' +
'<option value="4">C-sharp major</option>' +
'<option value="5">C-sharp minor</option>' +
'<option value="6">D-flat major</option>' +
'<option value="7">D-flat minor</option>' +
'<option value="8">D major</option>' +
'<option value="9">D minor</option>' +
'<option value="10">D-sharp minor</option>' +
'<option value="11">E-flat major</option>' +
'<option value="12">E-flat minor</option>' +
'<option value="13">E major</option>' +
'<option value="14">E minor</option>' +
'<option value="15">E-sharp minor</option>' +
'<option value="16">F-flat major</option>' +
'<option value="17">F major</option>' +
'<option value="18">F minor</option>' +
'<option value="19">F-sharp major</option>' +
'<option value="20">F-sharp minor</option>' +
'<option value="21">G-flat major</option>' +
'<option value="22">G major</option>' +
'<option value="23">G minor</option>' +
'<option value="24">G-sharp major</option>' +
'<option value="25">G-sharp minor</option>' +
'<option value="26">A-flat major</option>' +
'<option value="27">A-flat minor</option>' +
'<option value="28">A major</option>' +
'<option value="29">A minor</option>' +
'<option value="30">A-sharp minor</option>' +
'<option value="31">B-flat major</option>' +
'<option value="32">B-flat minor</option>' +
'<option value="33">B major</option>' +
'<option value="34">B minor</option>' +
'<option value="789">C Dorian</option>' +
'<option value="790">D Dorian</option>' +
'<option value="791">E Dorian</option>' +
'<option value="792">F Dorian</option>' +
'<option value="793">G Dorian</option>' +
'<option value="794">A Dorian</option>' +
'<option value="795">B Dorian</option>' +
'</select>'
};

// https://www.wikidata.org/wiki/Wikidata:List_of_properties/Person
var wikidata = {
    'language': 'en',
    'entities': {
        person: 5,
        stringQuartet: 207338,
        orchestra: 42998,
        band: 215380,
        rockBand: 5741069,
        male: 6581097,
        female: 6581072
    },
    'fields': {
        type: 'P31',
        gender: 'P21',
        citizen: 'P27',
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
        idIMSLP: 'P839',
        idBNF: 'P268'
    },
    'urls': {
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

    self.POST = function (url, param, successCallback, failCallback) {
        self._request('POST', url, param, function (xhr) {
            if (xhr.status === 200 || xhr.status === 0) {
                successCallback(xhr);
            } else {
                failCallback(xhr);
            }
        });
    };
    return self;
}();


var edits = function () {
    var self = {};

    self.urlFromMbid = function (entityType, mbid) {
        return '/' + entityType + '/' + encodeURIComponent(mbid) + '/edit';
    };

    /* in order to determine the edit parameters required by POST
     * we first load the /edit page and parse the JSON data
     * in the sourceData block
     */
    self.getEditParams = function (url, callback) {
        requests.GET(url, function (resp) {
            var data = new RegExp('sourceData: (.*),\n').exec(resp)[1];
            callback(JSON.parse(data));
        });
    };

    self.encodeName = function (name) {
        return encodeURIComponent(name).replace(/%20/g, '+');
    };

    self.formatEdit = function (editType, info) {
        var data = [];
        _.forOwn(info, function (value, key) {
            if (value === null) {
                data.push(editType + '.' + key);
            } else {
                data.push(editType + '.' + key + '=' + value);
            }
        })
        return data.join('&');
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
        var link = server.recordingLinkType,
            order = [link.vocals, link.instrument, link.orchestra,
                     link.conductor, link.performer];
        if (a.link === b.link) {return 0;}
        return order.indexOf(a.link) > order.indexOf(b.link) ? 1 : -1;
    };

    self.mbidFromURL = function () {
        return document.URL.split('/')[4];
    };

    self.wsUrl = function (entityType, options) {
        var url = '/ws/2/' + entityType + '/'
        url += encodeURIComponent(self.mbidFromURL())
        url += '?fmt=json';
        options.forEach(function (option) {
            url += '&inc=' + option;
        });
        return url;
    };

    self._isEntityTypeURL = function(entityType) {
        return document.URL.split('/')[3] === entityType;
    };
    self.isArtistURL = self._isEntityTypeURL('artist');
    self.isReleaseURL = self._isEntityTypeURL('release');
    self.isWorkURL = self._isEntityTypeURL('work');

    return self;
}();


var sidebar = function ($) {
    var self = {};

    // edit notes
    self.editNote = function (meta, msg) {
        msg = msg || '';
        var signature = '\n —\n' +
                        'GM script: "' + meta.name + '" (' + meta.version + ')\n\n';
        return (msg + signature);
    };

    self.container = function () {
        var $container;
        if ($('div#loujine-sidebar').length) {
            $container = $('div#loujine-sidebar');
        } else {
            $container = $('<div>', {
                'id': 'loujine-sidebar',
                'css': {
                    'background-color': 'white',
                    'padding': '8px',
                    'margin': '0px -6px 6px',
                    'border': '2px dotted #736DAB'
                }
            }).append(
                $('<h2>', {'text': 'loujine GM tools'})
            ).append(
                $('<a>', {
                    'href': wikiUrl,
                    'target': '_blank',
                    'text': 'documentation'}
                 )
            );
        }
        $('h2.rating').before($container);
        return $container;
    };

    return self;
}($);


var relEditor = function (MB, $) {
    var self = {};

    // edit note
    self.editNote = function (meta, msg) {
        msg = msg || '';
        var vm = MB.releaseRelationshipEditor,
            existingMsg = vm.editNote(),
            signature = '\n —\n' +
                        'GM script: "' + meta.name + '" (' + meta.version + ')\n\n';
        vm.editNote(existingMsg + msg + signature);
    };

    self.container = function () {
        var $container;
        if ($('div#loujine-menu').length) {
            $container = $('div#loujine-menu');
        } else {
            $container = $('<div>', {
                'id': 'loujine-menu',
                'css': {
                    'background-color': 'white',
                    'padding': '8px',
                    'margin': '0px -6px 6px',
                    'border': '5px dotted #736DAB'
                }
            }).append(
                $('<h2>', {'text': 'loujine GM tools'})
            ).append(
                $('<a>', {
                    'href': wikiUrl,
                    'target': '_blank',
                    'text': 'documentation'}
                 )
            );
        }
        return $container;
    };

    return self;
}(MB, $);
