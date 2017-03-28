/* global $ _ MB */
'use strict';
// ==UserScript==
// @name         mbz-loujine-common
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.3.11
// @description  musicbrainz.org: common functions
// @compatible   firefox+greasemonkey
// @license      MIT
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
    'workType': {
        'Song': 17,
        'Aria': 1,
        'Audio drama': 25,
        'Ballet': 2,
        'Beijing opera': 26,
        'Cantata': 3,
        'Concerto': 4,
        'Étude': 20,
        'Incidental music': 30,
        'Madrigal': 7,
        'Mass': 8,
        'Motet': 9,
        'Musical': 29,
        'Opera': 10,
        'Operetta': 24,
        'Oratorio': 11,
        'Overture': 12,
        'Partita': 13,
        'Play': 28,
        'Poem': 21,
        'Prose': 23,
        'Quartet': 14,
        'Sonata': 5,
        'Song-cycle': 15,
        'Soundtrack': 22,
        'Suite': 6,
        'Symphonic poem': 18,
        'Symphony': 16,
        'Zarzuela': 19
    },
    'workLinkType': {
        'subwork': 281,
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
    'aliasArtistType': {
        'Artist name': 1,
        'Legal name': 2,
        'Search hint': 3
    },
    'aliasType': {
        'Name': 1,
        'Search hint': 2
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
    'language': {
        '[Multiple languages]': 284,
        '[No lyrics]': 486,
        'Arabic': 18,
        'Chinese': 76,
        'Czech': 98,
        'Danish': 100,
        'Dutch': 113,
        'English': 120,
        'Finnish': 131,
        'French': 134,
        'German': 145,
        'Greek': 159,
        'Italian': 195,
        'Japanese': 198,
        'Korean': 224,
        'Polish': 338,
        'Portuguese': 340,
        'Russian': 353,
        'Spanish': 393,
        'Swedish': 403,
        'Turkish': 433
    },
    'languageFromISO': {
        'ara': 'Arabic',
        'zho': 'Chinese',
        'ces': 'Czech',
        'dan': 'Danish',
        'nld': 'Dutch',
        'eng': 'English',
        'fin': 'Finnish',
        'fra': 'French',
        'deu': 'German',
        'ell': 'Greek',
        'ita': 'Italian',
        'jpn': 'Japanese',
        'kor': 'Korean',
        'mul': '[Multiple languages]',
        'pol': 'Polish',
        'por': 'Portuguese',
        'rus': 'Russian',
        'spa': 'Spanish',
        'swe': 'Swedish',
        'tur': 'Turkish',
        'zxx': '[No lyrics]'
    },
    'locale': {
        'Arabic': 'ar',
        'Chinese': 'zh',
        'Czech': 'cs',
        'Danish': 'da',
        'Dutch': 'nl',
        'English': 'en',
        'Esperanto': 'eo',
        'Estonian': 'et',
        'Finnish': 'fi',
        'French': 'fr',
        'German': 'de',
        'Greek': 'el',
        'Hebrew': 'he',
        'Hindi': 'hi',
        'Hungarian': 'hu',
        'Italian': 'it',
        'Japanese': 'ja',
        'Khmer (Central)': 'km',
        'Korean': 'ko',
        'Norwegian Bokmål': 'nb',
        'Norwegian Nynorsk': 'nn',
        'Persian': 'fa',
        'Polish': 'pl',
        'Portuguese': 'pt',
        'Punjabi': 'pa',
        'Russian': 'ru',
        'Slovak': 'sk',
        'Spanish': 'es',
        'Swedish': 'sv',
        'Thai': 'th',
        'Turkish': 'tr',
        'Urdu': 'ur',
        'Vietnamese': 'vi'
    },
    'workKeyAttr': {
        'C major': 2,
        'C minor': 3,
        'C-sharp major': 4,
        'C-sharp minor': 5,
        'D-flat major': 6,
        'D-flat minor': 7,
        'D major': 8,
        'D minor': 9,
        'D-sharp minor': 10,
        'E-flat major': 11,
        'E-flat minor': 12,
        'E major': 13,
        'E minor': 14,
        'E-sharp minor': 15,
        'F-flat major': 16,
        'F major': 17,
        'F minor': 18,
        'F-sharp major': 19,
        'F-sharp minor': 20,
        'G-flat major': 21,
        'G major': 22,
        'G minor': 23,
        'G-sharp major': 24,
        'G-sharp minor': 25,
        'A-flat major': 26,
        'A-flat minor': 27,
        'A major': 28,
        'A minor': 29,
        'A-sharp minor': 30,
        'B-flat major': 31,
        'B-flat minor': 32,
        'B major': 33,
        'B minor': 34,
        'C Dorian': 789,
        'D Dorian': 790,
        'E Dorian': 791,
        'F Dorian': 792,
        'G Dorian': 793,
        'A Dorian': 794,
        'B Dorian': 795
    },
    // https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
    // we wait for 'server.timeout' milliseconds between two queries
    'timeout': 1000
};

var aliases = {
    'artistType': [
        '<select>',
        '<option selected> </option>',
        _.map(server.aliasArtistType, function (code, type) {
            return '<option value="' + code + '">' + type + '</option>';
        }).join(''),
        '</select>'
    ].join(''),

    'type': [
        '<select>',
        '<option selected> </option>',
        _.map(server.aliasType, function (code, type) {
            return '<option value="' + code + '">' + type + '</option>';
        }).join(''),
        '</select>'
    ].join(''),

    'locale': [
        '<select>',
        '<option> </option>',
        _.map(server.locale, function (code, type) {
            return '<option value="' + code + '">' + type + '</option>';
        }).join(''),
        '</select>'
    ].join(''),
};

var works = {
    'type': [
        '<select class="setwork">',
        '<option selected> </option>',
        _.map(server.workType, function (code, type) {
            return '<option value="' + code + '">' + type + '</option>';
        }).join(''),
        '</select>'
    ].join(''),

    'lang': [
        '<select class="setlang">',
        '<option> </option>',
        '<optgroup label="Frequently used">',
        _.map(server.language, function (code, type) {
            return '<option class="language" value="' + code + '">' + type + '</option>';
        }).join(''),
        '</optgroup>',
        '<optgroup label="Other">',
        '<option class="language" value="238">Latin</option>',
        '</optgroup>',
        '</select>'
    ].join(''),

    'key': [
        '<select class="setkey">',
        '<option selected> </option>',
        _.map(server.workKeyAttr, function (code, type) {
            return '<option value="' + code + '">' + type + '</option>';
        }).join(''),
        '</select>'
    ].join(''),
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

var parseWD = function () {
    var self = {};

    self.existField = function (entity, field) {
        return entity.claims[wikidata.fields[field]] !== undefined;
    };

    self.valueFromField = function (entity, field) {
        return entity.claims[wikidata.fields[field]][0].mainsnak.datavalue.value;
    };

    self.setValue = function (nodeId, value, callback) {
        var node = document.getElementById(nodeId);
        if (!node.value.trim()) {
            node.value = value;
        } else if (node.value != value) {  // != to allow autocasting to int
            $(document.getElementById(nodeId)).parent()
            .append('<p>Wikidata suggests: "' + value + '"</p>')
            .css('color', 'red');
            callback();
        }
    };

    self.fillArea = function (data, place, nodeId, lang) {
        var entityArea = data.entities[place],
            input = document.getElementById('id-edit-artist.' + nodeId + '.name');
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
        var prefix = 'id-edit-' + entityType + '.period.' + nodeId;
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

    self.getWorkEditParams = function (url, callback) {
        requests.GET(url, function (resp) {
            var data = JSON.parse(resp);
            callback({
                name: data.title,
                type_id: server.workType[data.type],
                language_id: server.language[
                    server.languageFromISO[data.language]],
                iswcs: data.iswcs,
                attributes: data.attributes
            });
        });
    };

    self.encodeName = function (name) {
        return encodeURIComponent(name).replace(/%20/g, '+');
    };

    self.prepareEdit = function (editData) {
        var data = {
            name: self.encodeName(editData.name),
            type_id: editData.type_id || '',
            language_id: editData.language_id || '',
        };
        if (editData.iswcs === undefined || !editData.iswcs.length) {
            data['iswcs.0'] = null;
        } else {
            editData.iswcs.forEach(function (iswc, idx) {
                data['iswcs.' + idx] = iswc;
            });
        }
        // attributes (key)
        if (editData.attributes) {
            editData.attributes.forEach(function (attr, idx) {
                data['attributes.' + idx + '.type_id'] = attr.type_id;
                data['attributes.' + idx + '.value'] = attr.value;
            });
        }
        return data
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

    self.mbidFromURL = function (url) {
        if (url === undefined) {
            url = document.URL;
        }
        return url.split('/')[4];
    };

    self.wsUrl = function (entityType, options, mbid) {
        var url = '/ws/2/' + entityType + '/',
            mbid = mbid !== undefined ? mbid : self.mbidFromURL();
        url += encodeURIComponent(mbid);
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

    self.sortSubworks = function (work) {
        var rels = work.relationships;
        rels = _.filter(rels, function (rel) {
            return (rel.linkTypeID === server.workLinkType.subwork
                    && rel.direction !== 'backward');
        });
        rels = _.sortBy(rels, function (rel) {return rel.linkOrder;});
        return rels.map(function (rel) {return rel.target});
    };

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
        $('h2.collections').before($container);
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