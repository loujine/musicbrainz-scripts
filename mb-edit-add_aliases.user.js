/* global $ */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Add entity aliases in batch
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.10.21
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/aliases_for_ff44/mb-edit-add_aliases.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/aliases_for_ff44/mb-edit-add_aliases.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org edit: Add entity aliases in batch
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://*musicbrainz.org/*/*/aliases*
// @exclude      http*://*musicbrainz.org/doc/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function buildOptions(obj) {
    return Object.keys(obj)
        .map(type => `<option value="${obj[type]}">${type}</option>`)
        .join('');
}

function buildLocaleOptions(obj) {
    return Object.keys(obj)
        .map(short => `<option value="${short}">${short} ${obj[short]}</option>`)
        .join('');
}

const server = {
    aliasArtistType: {
        'Artist name': 1,
        'Legal name': 2,
        'Search hint': 3,
    },
    aliasInstrumentType: {
        'Instrument name': 1,
        'Search hint': 2,
        'Brand name': 3,
    },
    aliasType: {
        'Name': 1,
        'Search hint': 2,
    },
    // musicbrainz-server/root/static/scripts/common/constants/locales.json
    locale: {
        'af': 'Afrikaans',
        'am': 'Amharic',
        'ar': 'Arabic',
        'ast': 'Asturian',
        'az': 'Azerbaijani',
        'be': 'Belarusian',
        'bg': 'Bulgarian',
        'bn': 'Bangla',
        'br': 'Breton',
        'bs': 'Bosnian',
        'ca': 'Catalan',
        'ckb': 'Central Kurdish',
        'ckb': 'Central Kurdish/Sorani',
        'cs': 'Czech',
        'cy': 'Welsh',
        'da': 'Danish',
        'de': 'German',
        'el': 'Greek',
        'en': 'English',
        'eo': 'Esperanto',
        'es': 'Spanish',
        'et': 'Estonian',
        'eu': 'Basque',
        'fa': 'Persian',
        'fi': 'Finnish',
        'fil': 'Filipino',
        'fo': 'Faroese',
        'fr': 'French',
        'fy': 'Western Frisian',
        'ga': 'Irish',
        'gd': 'Scottish Gaelic',
        'gl': 'Galician',
        'gu': 'Gujarati',
        'haw': 'Hawai’ian',
        'he': 'Hebrew',
        'hi': 'Hindi',
        'hr': 'Croatian',
        'hu': 'Hungarian',
        'hy': 'Armenian',
        'ia': 'Interlingua',
        'id': 'Indonesian',
        'is': 'Icelandic',
        'it': 'Italian',
        'ja': 'Japanese',
        'jv': 'Javanese',
        'ka': 'Georgian',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'kn': 'Kannada',
        'ko': 'Korean',
        'ky': 'Kyrgyz',
        'lb': 'Luxembourgish',
        'lt': 'Lithuanian',
        'lv': 'Latvian',
        'mi': 'Māori',
        'mk': 'Macedonian',
        'ml': 'Malayalam',
        'mn': 'Mongolian',
        'mr': 'Marathi',
        'ms': 'Malay',
        'my': 'Burmese',
        'nb': 'Norwegian Bokmål',
        'nn': 'Norwegian Nynorsk',
        'nds': 'Low German',
        'ne': 'Nepali',
        'nl': 'Dutch',
        'pa': 'Punjabi',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'qu': 'Quechua',
        'ro': 'Romanian',
        'ru': 'Russian',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'sq': 'Albanian',
        'sr': 'Serbian',
        'sv': 'Swedish',
        'sw': 'Swahili',
        'ta': 'Tamil',
        'te': 'Telugu',
        'tg': 'Tajik',
        'th': 'Thai',
        'tr': 'Turkish',
        'ug': 'Uyghur',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'yue': 'Cantonese',
        'zh': 'Chinese',
        'zh_Hans': 'Chinese Simplified',
        'zh_Hans_SG': 'Chinese Singapore Simplified',
        'zh_Hant': 'Chinese Traditional',
        'zh_Hant_HK': 'Chinese Hong Kong SAR China Traditional',
        'zh_Hant_TW': 'Chinese Taiwan Traditional',
        'zu': 'Zulu',
    },
}

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

const aliasType =
    document.URL.split('/')[3] === 'artist'
    ? aliases.artistType
    : (
        document.URL.split('/')[3] === 'instrument'
        ? aliases.instrumentType
        : aliases.type
    );

function addRow() {
    document.querySelector('tbody tr:last-child').insertAdjacentHTML('afterend', `
        <tr class="newAlias">
          <td><input type="text" value=""></td>
          <td><input type="text" value=""
                     placeholder="leave empty to use the name"></td>
          <td></td>
          <td></td>
          <td>${aliasType}</td>
          <td>
            ${aliases.locale}
            <input type="checkbox">
            <span>primary</span>
          </td>
          <td><a href="#" class="deleteRow" style="color:red;">×</a></td>
    `);
    document.querySelector('a.deleteRow').addEventListener('click', evt => {
        evt.target.parentElement.parentElement.remove();
    });
}

function edits_encodeName(name) {
    return encodeURIComponent(name).replace(/%20/g, '+');
}

function sidebar_editNote(meta, msg) {
    msg = msg || '';
    const signature = `\n —\nGM script: "${meta.name}" (${meta.version})`;
    return msg + signature;
}

function edits_formatEdit(editType, info) {
    return Object.keys(info)
        .map(prop =>
            info[prop] === null
            ? `${editType}.${prop}`
            : `${editType}.${prop}=${info[prop]}`
        )
        .join('&');
}

function _request(verb, url, param, callback) {
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
}

function requests_POST(url, param, successCallback, failCallback) {
    _request('POST', url, param, function (xhr) {
        if (xhr.status === 200 || xhr.status === 0) {
            successCallback(xhr);
        } else {
            failCallback(xhr);
        }
    });
}

function submitAliases() {
    document.getElementsByClassName('newAlias').forEach(node => {
        const cols = node.children;
        const postData = {
            name: edits_encodeName(cols[0].children[0].value),
            sort_name: edits_encodeName(cols[1].children[0].value),
            type_id: cols[4].children[0].value,
            locale: cols[5].children[0].value,
            primary_for_locale: cols[5].children[1].checked ? 1 : 0,
            edit_note: sidebar_editNote(GM_info.script),
        };
        if (postData.sort_name === '') {
            postData.sort_name = postData.name;
        }
        cols[6].textContent = 'Sending edit data';
        console.info('Data ready to be posted: ', postData);
        requests_POST(
            document.URL.replace('aliases', 'add-alias'),
            edits_formatEdit('edit-alias', postData),
            // success
            xhr => {
                cols[6].textContent = `Success (code ${xhr.status})`;
                cols[6].parentElement.style.color = 'green';
            },
            // fail
            xhr => {
                cols[6].textContent = `Error (code ${xhr.status})`;
                cols[6].parentElement.style.color = 'red';
            }
        );
        node.classList.remove('newAlias');
    });
}

$(document).ready(function () {
    // doesn't work on translated pages
    document.getElementById('content').getElementsByTagName('p').forEach(node => {
        if (node.innerHTML.includes('has no aliases')) {
            node.innerHTML = `
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Alias</th>
                      <th>Sort name</th>
                      <th>Begin Date</th>
                      <th>End Date</th>
                      <th>Type</th>
                      <th>Locale</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr></tr>
                  </tbody>
                </table>`;
        }
    });
    document.getElementsByTagName('table')[0].insertAdjacentHTML('beforebegin', `
        <h3>Add aliases manually</h3>
        <input type="button" id="addRow" value="+ Add a new row">
        <input type="button" id="submitAliases" value="Submit new aliases">
    `);
    document.getElementById('addRow').addEventListener('click', addRow);
    document.getElementById('submitAliases').addEventListener('click', submitAliases);
    return false;
});
