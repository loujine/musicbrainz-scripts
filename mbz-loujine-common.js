/* global MB */
'use strict';
// ==UserScript==
// @name         mbz-loujine-common
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.3.12
// @description  musicbrainz.org: common functions
// @compatible   firefox+greasemonkey
// @license      MIT
// @grant        none
// @run-at       document-end
// ==/UserScript==

// github wiki
const wikiUrl = 'https://github.com/loujine/musicbrainz-scripts/wiki';

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
class Server {

  constructor() {
    this.recordingLinkType = {
      instrument: 148,
      vocals: 149,
      orchestra: 150,
      conductor: 151,
      chorusmaster: 152,
      concertmaster: 760,
      performer: 156,
      work: 278,
      place: 693,
      area: 698,
    };
    this.instrumentType = {
      instrument: 14,
      strings: 69,
      bass: 70,
      double_bass: 71,
      acoustic_bass_guitar: 73,
      electric_bass_guitar: 74,
      guitar_family: 75,
      violin_family: 82,
      cello: 84,
      violin: 86,
      membranophone: 125,
      drums: 126,
      harpsichord: 174,
      piano: 180,
      guitar: 229,
      bass_guitar: 277,
      string_quartet: 1067,
    };
    this.vocalType = {
      vocal: 3,
      lead: 4,
      alto: 5,
      bass: 7,
      soprano: 10,
      tenor: 11,
      choir: 13,
    };
    this.workType = {
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
      'Zarzuela': 19,
    };
    this.workLinkType = {
      arrangement: 350,
      composer: 168,
      subwork: 281,
      writer: 167,
    };
    this.releaseLinkTypeID = {
      44: 'instrument',
      60: 'vocals',
      45: 'orchestra',
      46: 'conductor',
      53: 'chorusmaster',
      51: 'performer',
    };
    this._performingRoles = [
      'instrument',
      'vocals',
      'orchestra',
      'conductor',
      'performer',
    ];
    this._minorPerformingRoles = [
      'concertmaster',
      'chorusmaster',
    ];
    this.aliasArtistType = {
      'Artist name': 1,
      'Legal name': 2,
      'Search hint': 3,
    };
    this.aliasInstrumentType = {
      'Instrument name': 1,
      'Search hint': 2,
      'Brand name': 3,
    };
    this.aliasType = {
      'Name': 1,
      'Search hint': 2,
    };
    this.attr = {
      additional: 1,
      strings: 69,
      cello: 84,
      violin: 86,
      piano: 180,
      guest: 194,
      bowedStrings: 275,
      string_quartet: 1067,
      piano_trio: 1070,
      string_trio: 1074,
      cover: 567,
      live: 578,
      partial: 579,
      instrumental: 580,
      video: 582,
      solo: 596,
      medley: 750,
    };
    this.language = {
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
      'Hungarian': 176,
      'Italian': 195,
      'Japanese': 198,
      'Korean': 224,
      'Norwegian': 309,
      'Occitan': 318,
      'Polish': 338,
      'Portuguese': 340,
      'Russian': 353,
      'Spanish': 393,
      'Swedish': 403,
      'Turkish': 433,
    };
    this.languageFromISO = {
      ara: 'Arabic',
      zho: 'Chinese',
      ces: 'Czech',
      dan: 'Danish',
      nld: 'Dutch',
      eng: 'English',
      fin: 'Finnish',
      fra: 'French',
      deu: 'German',
      ell: 'Greek',
      hun: 'Hungarian',
      ita: 'Italian',
      jpn: 'Japanese',
      kor: 'Korean',
      mul: '[Multiple languages]',
      nor: 'Norwegian',
      oci: 'Occitan',
      pol: 'Polish',
      por: 'Portuguese',
      rus: 'Russian',
      spa: 'Spanish',
      swe: 'Swedish',
      tur: 'Turkish',
      zxx: '[No lyrics]',
    };
    this.locale = {
        'Afrikaans': 'af',
        'Albanian': 'sq',
        'Amharic': 'am',
        'Arab in Egypt': 'arz',
        'Arabic': 'ar',
        'Aragonese': 'an',
        'Armenian': 'hy',
        'Asturian': 'ast',
        'Azerbaijani': 'az',
        'Bangla': 'bn',
        'Bashkir': 'ba',
        'Basque': 'eu',
        'Belarusian': 'be',
        'Bosnian': 'bs',
        'Breton': 'br',
        'Bulgarian': 'bg',
        'Burmese': 'my',
        'Cantonese': 'yue',
        'Catalan': 'ca',
        'Central Kurdish/Sorani': 'ckb',
        'Cherokee': 'chr',
        'Chinese Hong Kong SAR China Traditional': 'zh_Hant_HK',
        'Chinese Simplified': 'zh_Hans',
        'Chinese Singapore Simplified': 'zh_Hans_SG',
        'Chinese Taiwan Traditional': 'zh_Hant_TW',
        'Chinese Traditional': 'zh_Hant',
        'Chinese': 'zh',
        'Chuvash': 'cv',
        'Corsican': 'co',
        'Croatian': 'hr',
        'Czech': 'cs',
        'Danish': 'da',
        'Dutch': 'nl',
        'English': 'en',
        'Esperanto': 'eo',
        'Estonian': 'et',
        'Faroese': 'fo',
        'Filipino': 'fil',
        'Finnish': 'fi',
        'French': 'fr',
        'Galician': 'gl',
        'Georgian': 'ka',
        'German': 'de',
        'Greek': 'el',
        'Guarani': 'gn',
        'Gujarati': 'gu',
        'Hawai’ian': 'haw',
        'Hebrew': 'he',
        'Hindi': 'hi',
        'Hungarian': 'hu',
        'Icelandic': 'is',
        'Ido': 'io',
        'Indonesian': 'id',
        'Interlingua': 'ia',
        'Irish': 'ga',
        'Italian': 'it',
        'Japanese': 'ja',
        'Javanese': 'jv',
        'Kannada': 'kn',
        'Kazakh': 'kk',
        'Khmer': 'km',
        'Korean': 'ko',
        'Kyrgyz': 'ky',
        'Latin': 'la',
        'Latvian': 'lv',
        'Ligurian': 'lij',
        'Lithuanian': 'lt',
        'Lombard': 'lmo',
        'Low German': 'nds',
        'Lule Sami': 'smj',
        'Luxembourgish': 'lb',
        'Māori': 'mi',
        'Macedonian': 'mk',
        'Maithili': 'mai',
        'Malay': 'ms',
        'Malayalam': 'ml',
        'Manx': 'gv',
        'Marathi': 'mr',
        'Mongolian': 'mn',
        'Nepali': 'ne',
        'Norwegian Bokmål': 'nb',
        'Norwegian Nynorsk': 'nn',
        'Norwegian': 'no',
        'Occitan': 'oc',
        'Persian': 'fa',
        'Polish': 'pl',
        'Portuguese': 'pt',
        'Punjabi': 'pa',
        'Quechua': 'qu',
        'Romanian': 'ro',
        'Romansh': 'rm',
        'Russian': 'ru',
        'Sanskrit': 'sa',
        'Sardinian': 'sc',
        'Scottish Gaelic': 'gd',
        'Serbian': 'sr',
        'Sicilian': 'scn',
        'Silesian': 'slz',
        'Sinhala': 'si',
        'Skolt Sami': 'sms',
        'Slovak': 'sk',
        'Slovenian': 'sl',
        'Somali': 'so',
        'Southern Kurdish': 'sdh',
        'Southern Sami': 'sma',
        'Spanish': 'es',
        'Sundanese Latin': 'su_Latn',
        'Sundanese': 'su',
        'Swahili': 'sw',
        'Swedish': 'sv',
        'Tajik': 'tg',
        'Tamil': 'ta',
        'Tatar': 'tt',
        'Telugu': 'te',
        'Thai': 'th',
        'Tok Pisin': 'tpi',
        'Turkish': 'tr',
        'Ukrainian': 'uk',
        'Urdu': 'ur',
        'Uyghur': 'ug',
        'Uzbek': 'uz',
        'Venetian': 'vec',
        'Vietnamese': 'vi',
        'Wallon': 'wa',
        'Welsh': 'cy',
        'Western Frisian': 'fy',
        'Yiddish': 'yi',
        'Yoruba': 'yo',
        'Zulu': 'zu',
    };
    this.workKeyAttr = {
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
      'B Dorian': 795,
    };
    this.unknownArtistId = 97546;
    // https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
    // we wait for 'server.timeout' milliseconds between two queries
    this.timeout = 1000;
  }

  releaseToRecordingLink(linkTypeID) {
    return this.recordingLinkType[this.releaseLinkTypeID[linkTypeID]];
  }

  performingLinkTypes(skipMinorRoles = false) {
    const roles = skipMinorRoles ? this._performingRoles : [
      ...this._performingRoles, ...this._minorPerformingRoles
    ];
    return roles.map(role => this.recordingLinkType[role]);
  }
}

const server = new Server();


function buildOptions(obj) {
  // to be replaced by Object.entries when all supported browser versions
  // recognize it
  return Object.entries(obj)
    .map(([type, code]) => `<option value="${code}">${type}</option>`)
    .join('');
}

function buildLanguageOptions(obj) {
  return Object.entries(obj)
    .map(
      ([type, code]) =>
        `<option class="language" value="${code}">${type}</option>`
    )
    .join('');
}

function buildLocaleOptions(obj) {
  return Object.entries(obj)
    .map(
      ([type, code]) =>
        `<option class="language" value="${code}">${code} ${type}</option>`
    )
    .sort()
    .join('');
}

// eslint-disable-next-line no-unused-vars
const aliases = {
  artistType: `
    <select>
      <option selected> </option>
      ${buildOptions(server.aliasArtistType)}
    </select>
  `,
  instrumentType: `
    <select>
      <option selected> </option>
      ${buildOptions(server.aliasInstrumentType)}
    </select>
  `,
  type: `
    <select>
      <option selected> </option>
      ${buildOptions(server.aliasType)}
    </select>
  `,
  locale: `
    <select>
      <option> </option>
      ${buildLocaleOptions(server.locale)}
    </select>
  `,
};

// eslint-disable-next-line no-unused-vars
const works = {
  type: `
    <select class="setwork">
      <option selected> </option>
      ${buildOptions(server.workType)}
    </select>
  `,

  lang: `
    <select class="setlang">
      <option> </option>
      <optgroup label="Frequently used">
      ${buildLanguageOptions(server.language)}
      </optgroup>
      <optgroup label="Other">
      <option class="language" value="238">Latin</option>
      </optgroup>
    </select>
  `,

  key: `
    <select class="setkey">
      <option selected> </option>
      ${buildOptions(server.workKeyAttr)}
    </select>
  `,
};

// eslint-disable-next-line no-unused-vars
const roles = {
  roles: `
    <option value="122" disabled="">performance</option>
    <option value="156">&nbsp;&nbsp;performer</option>
    <option value="148">&nbsp;&nbsp;&nbsp;&nbsp;instruments</option>
    <option value="149">&nbsp;&nbsp;&nbsp;&nbsp;vocals</option>
    <option value="150">&nbsp;&nbsp;orchestra</option>
    <option value="151">&nbsp;&nbsp;conductor</option>
    <option value="152">&nbsp;&nbsp;chorus master</option>
    <option value="760">&nbsp;&nbsp;concertmaster</option>
    <option value="297">arranger</option>
    <option value="158">&nbsp;&nbsp;instruments arranger</option>
    <option value="300">&nbsp;&nbsp;&nbsp;&nbsp;orchestrator</option>
    <option value="298">&nbsp;&nbsp;vocals arranger</option>
    <option value="157" disabled="">remixes and compilations</option>
    <option value="153">&nbsp;&nbsp;remixer</option>
    <option value="147">&nbsp;&nbsp;compiler</option>
    <option value="155">&nbsp;&nbsp;DJ-mixer</option>
    <option value="154">&nbsp;&nbsp;contains samples by</option>
    <option value="160" disabled="">production</option>
    <option value="141">&nbsp;&nbsp;producer</option>
    <option value="138">&nbsp;&nbsp;engineer</option>
    <option value="140">&nbsp;&nbsp;&nbsp;&nbsp;audio engineer</option>
    <option value="136">&nbsp;&nbsp;&nbsp;&nbsp;mastering</option>
    <option value="133">&nbsp;&nbsp;&nbsp;&nbsp;sound engineer</option>
    <option value="143">&nbsp;&nbsp;&nbsp;&nbsp;mixer</option>
    <option value="128">&nbsp;&nbsp;&nbsp;&nbsp;recording engineer</option>
    <option value="132">&nbsp;&nbsp;&nbsp;&nbsp;programming</option>
    <option value="144">&nbsp;&nbsp;&nbsp;&nbsp;editor</option>
    <option value="726">&nbsp;&nbsp;&nbsp;&nbsp;balance engineer</option>
    <option value="129">&nbsp;&nbsp;miscellaneous support</option>
    <option value="142">&nbsp;&nbsp;&nbsp;&nbsp;legal representation</option>
    <option value="869">&nbsp;&nbsp;&nbsp;&nbsp;phonographic copyright by</option>
    <option value="858">&nbsp;&nbsp;&nbsp;&nbsp;visual appearances</option>
    <option value="134">&nbsp;&nbsp;&nbsp;&nbsp;booking</option>
    <option value="135">&nbsp;&nbsp;&nbsp;&nbsp;artist &amp; repertoire support</option>
    <option value="146">&nbsp;&nbsp;&nbsp;&nbsp;creative direction</option>
    <option value="137">&nbsp;&nbsp;&nbsp;&nbsp;art direction</option>
    <option value="130">&nbsp;&nbsp;&nbsp;&nbsp;design/illustration</option>
    <option value="125">&nbsp;&nbsp;&nbsp;&nbsp;graphic design</option>
    <option value="123">&nbsp;&nbsp;&nbsp;&nbsp;photography</option>
    <option value="931">&nbsp;&nbsp;&nbsp;&nbsp;piano technician</option>
    <option value="127">&nbsp;&nbsp;&nbsp;&nbsp;publisher</option>
  `,
  roleAttrs: `
    <option selected> </option>
    <option disabled="">instruments</option>
    ${buildOptions(server.instrumentType)}
    <option disabled="">vocals</option>
    ${buildOptions(server.vocalType)}
  `,
};

const requests = (function () {
  const self = {};

  self._request = function (verb, url, param, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr); // eslint-disable-line callback-return
      }
    };
    xhr.open(verb, url, true);
    if (verb === 'POST') {
      xhr.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded'
      );
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
        callback(xhr.responseText); // eslint-disable-line callback-return
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
})();

class Edits {

  urlFromMbid(entityType, mbid) {
    return `/${entityType}/${encodeURIComponent(mbid)}/edit`;
  }

  /* in order to determine the edit parameters required by POST
   * we first load the /edit page and parse the JSON data
   * in the sourceData (before 2023) or source_entity block
   */
  getEditParams(url, callback) {
    requests.GET(url, resp => {
      let data;
      if (resp.includes('source_entity')) {
        data = new RegExp(/source_entity":(.*)},"user":/).exec(resp)[1];
      } else {
        // pre PR musicbrainz-server#2582
        data = new RegExp(/sourceData: (.*),\n/).exec(resp)[1];
      }
      callback(JSON.parse(data));
    });
  }

  getWorkEditParams(url, callback) {
    this.getEditParams(url, data => {
      const editData = {
        name: data.name,
        type_id: data.typeID,
        languages: data.languages.map(it => it.language.id),
        iswcs: data.iswcs.map(it => it.iswc),
        attributes: data.attributes.map(attr => ({
          type_id: attr.typeID,
          value: attr.value,
        })),
      };
      callback(editData);
    });
  }

  /* get edit POST parameters from a JSON API call
   * need to reconvert all values to internal ids */
  getWorkEditParamsFromJSON(url, callback) {
    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        const editData = {
          name: data.title,
          type_id: server.workType[data.type],
          languages: data.languages.map(l => server.languageFromISO[l]),
          iswcs: data.iswcs,
          relations: data.relations,
        };
        editData.attributes = data.attributes.filter(
          attr => attr.type === 'Key'
        ).map(attr =>
          ({
            type_id: 1,
            value: server.workKeyAttr[attr.value],
          })
        );
        callback(editData);
      });
  }

  encodeName(name) {
    return encodeURIComponent(name).replace(/%20/g, '+');
  }

  prepareEdit(editData) {
    const data = {
      name: this.encodeName(editData.name),
      type_id: editData.type_id || ' ',
    };
    editData.languages.forEach((lang, idx) => {
      // FIXME error message if unknown language, edit will fail
      data['languages.' + idx] = server.language[lang] ? server.language[lang] : lang;
    });
    if (editData.iswcs === undefined || !editData.iswcs.length) {
      data['iswcs.0'] = null;
    } else {
      editData.iswcs.forEach((iswc, idx) => {
        data['iswcs.' + idx] = iswc;
      });
    }
    // attributes (key)
    if (editData.attributes) {
      editData.attributes.forEach((attr, idx) => {
        data['attributes.' + idx + '.type_id'] = attr.type_id;
        data['attributes.' + idx + '.value'] = attr.value;
      });
    }
    return data;
  }

  formatEdit(editType, info) {
    return Object.entries(info)
      .map(([prop, val]) =>
        val === null
          ? `${editType}.${prop}`
          : `${editType}.${prop}=${val}`
      )
      .join('&');
  }
}

// eslint-disable-next-line no-unused-vars
const edits = new Edits();


class Helper {

  comparefct(a, b) {
    // Sort function for performers in the recording artist list
    const link = server.recordingLinkType;
    const order = [
      link.vocals,
      link.instrument,
      link.orchestra,
      link.conductor,
      link.performer,
    ];
    if (a.link === b.link) {
      return 0;
    }
    return order.indexOf(a.link) > order.indexOf(b.link) ? 1 : -1;
  }

  mbidFromURL(url) {
    return (url || document.URL).split('/')[4].slice(0, 36);
  }

  wsUrl(entityType, options, mbid) {
    let url = `/ws/2/${entityType}/`;
    mbid = mbid || this.mbidFromURL();
    options = options || [];
    url += encodeURIComponent(mbid);
    url += '?fmt=json';
    options.forEach((option, idx) => {
      const prefix = idx === 0 ? '&inc=' : encodeURIComponent(' ');
      url += prefix + option;
    });
    return new URL(
      url,
      document.location.protocol + '//' + document.location.host
    );
  }

  _isEntityTypeURL(entityType) {
    return document.URL.split('/')[3] === entityType;
  }

  isArtistURL() {
    return this._isEntityTypeURL('artist');
  }

  isInstrumentURL() {
    return this._isEntityTypeURL('instrument');
  }

  isReleaseURL() {
    return this._isEntityTypeURL('release');
  }

  isWorkURL() {
    return this._isEntityTypeURL('work');
  }

  sortBy(key) {
    return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
  }

  sortSubworks(work) {
    let rels = work.relationships;
    rels = rels.filter(
      rel =>
        rel.linkTypeID === server.workLinkType.subwork &&
        !rel.backward
    );
    rels = rels.sort(this.sortBy('linkOrder'));
    return rels.map(rel => rel.target);
  }

  isUserLoggedIn() {
    const isLoggedIn = !document.querySelector('a[href*="/register"]');
    if (!isLoggedIn) {
      console.debug('User is not logged in, exiting the script');
    }
    return isLoggedIn;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  waitFor(pollingFunction, pollingInterval) {
    return new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
      while (pollingFunction() === false) {
        await this.delay(pollingInterval);
      }
      resolve();
    });
  }
}

// eslint-disable-next-line no-unused-vars
const helper = new Helper();


class Sidebar {
  editNote(meta, msg) {
    const separator = '\n —\n';
    msg = msg ? '\n' + msg : '';
    const signature = `GM script: "${meta.name}" (${meta.version})\n`;
    return [msg, signature].join(separator);
  }

  container() {
    const container = document.getElementById('loujine-sidebar');
    if (container !== null) {
      return container;
    }
    document.querySelector('#sidebar h2.editing + ul.links').insertAdjacentHTML('afterend', `
      <div id="loujine-sidebar"
         style="background-color: white;
            padding: 8px; margin: 0px -6px 6px;
            border: 5px dotted rgb(115, 109, 171);">
        <h2>loujine GM tools</h2>
        <a href="${wikiUrl}" target="_blank">documentation</a>
      </div>
    `);
    return document.getElementById('loujine-sidebar');
  }
}

// eslint-disable-next-line no-unused-vars
const sidebar = new Sidebar();


class RelationshipEditor {

  constructor() {
    this.dispatchDefaults = {
      batchSelectionCount: null,
      creditsToChangeForSource: '',
      creditsToChangeForTarget: '',
      oldRelationshipState: null,
    };
    this.stateDefaults = {
      _lineage: [],
      _original: null,
      _status: 0,
      attributes: null,
      begin_date: null,
      editsPending: false,
      end_date: null,
      ended: false,
      entity0_credit: '',
      entity1_credit: '',
      id: null,
      linkOrder: 0,
      linkTypeID: null,
    };
  }

  // from https://github.com/kellnerd/musicbrainz-scripts/blob/main/utils/dom/react.js
  setReactTextareaValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  editNote(meta, msg) {
    const node = document.getElementById('edit-note-text');
    msg = msg ? '\n' + msg : '';
    const separator = '\n —\n';
    const signature = `GM script: "${meta.name}" (${meta.version})\n`;
    let existingMsg = node.value;
    let existingSign;
    if (existingMsg.includes(separator)) {
      [existingMsg, existingSign] = existingMsg.split(separator);
      this.setReactTextareaValue(
        node,
        [existingMsg + msg, existingSign + signature].join(separator),
      );
    } else {
      this.setReactTextareaValue(
        node,
        [existingMsg + msg, signature].join(separator),
      );
    }

  }

  container(node) {
    const container = document.getElementById('loujine-menu');
    if (container !== null) {
      return container;
    }
    node.insertAdjacentHTML('afterend', `
      <div id="loujine-menu"
         style="background-color: white;
            padding: 8px; margin: 0px -6px 6px;
            border: 5px dotted rgb(115, 109, 171);">
        <h2>loujine GM tools</h2>
        <a href="${wikiUrl}" target="_blank">documentation</a>
      </div>
    `);
    return document.getElementById('loujine-menu');
  }

  // from https://github.com/kellnerd/musicbrainz-scripts/blob/main/src/relationship-editor/createRelationship.js
  createAttributeTree(attributes) {
    return MB.tree.fromDistinctAscArray(attributes
      .map((attribute) => {
        const attributeType = MB.linkedEntities.link_attribute_type[attribute.type.gid];
        return {
          ...attribute,
          type: attributeType,
          typeID: attributeType.id,
        };
      })
    );
  }

  orderedSelectedRecordings() {
    const recordings = MB.tree.toArray(MB.relationshipEditor.state.selectedRecordings);
    if (!recordings.length) {
      alert('No relation selected');
    }

    // sort recordings by order in tracklist to avoid having the dialog jump everywhere
    const recOrder = MB.getSourceEntityInstance().mediums.flatMap(
      // tracks on mediums 1-10 loaded by default
      m => m.tracks
    ).concat(
      // tracks on unfolded mediums
      Array.from(MB.relationshipEditor.state.loadedTracks.keys()).sort().flatMap(
        k => MB.relationshipEditor.state.loadedTracks.get(k)
      )
    ).map(t => t.recording.id);
    recordings.sort((r1, r2) => recOrder.indexOf(r1.id) - recOrder.indexOf(r2.id));
    return recordings;
  }

  parseDate(dateProp) {
    if (dateProp === null) {
      return {year: '', month: '', day: ''};
    }
    return {year: dateProp.year ?? '', month: dateProp.month ?? '', day: dateProp.day ?? ''};
  }
}

// eslint-disable-next-line no-unused-vars
const relEditor = new RelationshipEditor();
