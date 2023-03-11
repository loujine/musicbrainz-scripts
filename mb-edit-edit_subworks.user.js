/* global $ relEditor requests edits MB server sidebar helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Replace subwork titles, disambiguations and attributes in Work edit page
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.3.11
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org edit: Replace subwork titles/disambiguations/attributes in Work edit page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*/edit
// @exclude      http*://*musicbrainz.org/work/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

const success = (xhr, nodeIdx) => {
    const statusNode = document.getElementById(`replace${nodeIdx}`);
    const rx = new RegExp(
        '/edit/(\\d+)">edit</a>'
    ).exec(xhr.responseText);
    if (rx === null) {
        // usually means the POST was accepted but nothing was changed
        // i.e. the attributes names are wrong
        statusNode.textContent = 'Edit was probably not applied, please check';
        statusNode.parentElement.style.color = 'red';
        return;
    }
    const editId = rx[1];
    statusNode.parentElement.style.color = 'green';
    statusNode.insertAdjacentHTML(
        'afterend', `<p><a href="/edit/${editId}" target="_blank">edit ${editId}</a></p>`
    );
};

const fail = (xhr, nodeIdx) => {
    const statusNode = document.getElementById(`replace${nodeIdx}`);
    statusNode.textContent = `Error (code ${xhr.status})`;
    statusNode.parentElement.style.color = 'red';
};

function replaceSubworksTitles() {
    let delayIdx = 0;
    document.querySelectorAll('table tr.parts a[href*="/work/"]').forEach((node, nodeIdx) => {
        const searchExp = document.getElementById('subwork-regexp-search').value;
        const replaceExp = document.getElementById('subwork-regexp-replace').value;
        if (!searchExp || searchExp === replaceExp) {
            return;
        }
        const name = searchExp.match(/^\/.+\/[gi]*$/) ?
            node.textContent.replace(eval(searchExp), replaceExp) : // eslint-disable-line no-eval
            node.textContent.split(searchExp).join(replaceExp);
        if (name === node.textContent) {
            node.insertAdjacentHTML('afterend', '<span>nothing to replace</span>');
            return;
        }
        const mbid = helper.mbidFromURL(node.href);
        const url = edits.urlFromMbid('work', mbid);

        function callback(editData) {
            document.getElementById(`replace${nodeIdx}`).textContent = 'Sending edit data';
            editData.name = name;
            document.getElementById(`replace${nodeIdx}`).textContent = 'replaced by ' + name;
            const postData = edits.prepareEdit(editData);
            postData.edit_note = sidebar.editNote(GM_info.script);
            console.info('Data ready to be posted: ', postData);
            requests.POST(
                url,
                edits.formatEdit('edit-work', postData),
                (xhr) => success(xhr, nodeIdx),
                (xhr) => fail(xhr, nodeIdx)
            );
        }
        setTimeout(function () {
            node.insertAdjacentHTML(
                'afterend', ` <span id="replace${nodeIdx}">Fetching required data</span>`);
            edits.getWorkEditParams(url, callback);
        }, 2 * delayIdx * server.timeout);
        delayIdx += 1;
    });
}


function replaceSubworksDisambiguations(comment) {
    let delayIdx = 0;
    document.querySelectorAll('table tr.parts a[href*="/work/"]').forEach((node, nodeIdx) => {
        const mbid = helper.mbidFromURL(node.href);
        const url = edits.urlFromMbid('work', mbid);

        function callback(editData) {
            const statusNode = document.getElementById(`replace${nodeIdx}`);
            statusNode.textContent = ` (${comment})`;
            if (node.parentElement.querySelector('.comment')) {
                node.parentElement.querySelector('.comment').textContent = "";
            }
            const postData = edits.prepareEdit(editData);
            postData.comment = comment; // workaround, it would be better to let prepareEdit() handle this
            postData.edit_note = sidebar.editNote(GM_info.script);
            console.info('Data ready to be posted: ', postData);
            requests.POST(
                url,
                edits.formatEdit('edit-work', postData),
                (xhr) => success(xhr, nodeIdx),
                (xhr) => fail(xhr, nodeIdx)
            );
        }
        setTimeout(function () {
            node.insertAdjacentHTML(
                'afterend', ` <span id="replace${nodeIdx}">Fetching required data</span>`);
            edits.getWorkEditParams(url, callback);
        }, 2 * delayIdx * server.timeout);
        delayIdx += 1;
    });
}


function setSubworksAttributes(attrName) {
    document.querySelectorAll('table tr.parts button.edit-item').forEach(async (button, swIdx) => {
        await helper.delay(swIdx * 10);
        await helper.waitFor(() => !MB.relationshipEditor.relationshipDialogDispatch, 1);

        button.click();
        await helper.waitFor(() => !!MB.relationshipEditor.relationshipDialogDispatch, 1);

        document.querySelector(`.dialog-content input#${attrName}-checkbox`).click();
        await helper.delay(1);

        document.querySelector('.dialog-content button.positive').click();
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
        <h3>Replace subworks titles</h3>
        <p>
          Search for a string or regular expression (e.g. /sonata Op.(.+)/i).
          Replace with a string that can call groups from the search regexp ($1, $2...).
        </p>
        <input type="text" id="subwork-regexp-search" value=""
               placeholder="Searched string or regexp">
        <input type="text" id="subwork-regexp-replace" value="" placeholder="Replacing string">
        <input type="button" id="replaceTitles" value="Apply" disabled="True">

        <h3>Replace subworks disambiguations</h3>
        <input type="text" id="subwork-disambiguation" value="" placeholder="Disambiguation">
        <input type="button" id="replaceSubworksDisambiguations"
            value="Replace disambiguation for all subworks">

        <h3>Set subworks attributes</h3>
        <select id="subwork_attribute">
          <option value=""></option>
          <option value="act">act</option>
          <option value="movement">movement</option>
          <option value="number">number</option>
          <option value="part-of-collection">part of collection</option>
        </select>
        <input type="button" id="setSubworksAttributes" value="Set attribute on all subworks">

    `);
    document.getElementById('loujine-menu').style.marginLeft = '550px';
})();


$(document).ready(function () {
    if (!helper.isUserLoggedIn()) {
        return false;
    }
    document.getElementById('subwork-regexp-search').addEventListener('keydown', () => {
        document.getElementById('replaceTitles').disabled = false;
    });
    document.getElementById('replaceTitles').addEventListener('click', () => {
        replaceSubworksTitles();
    });
    document.getElementById('replaceSubworksDisambiguations').addEventListener('click', () => {
        replaceSubworksDisambiguations(document.getElementById('subwork-disambiguation').value);
    });
    document.getElementById('setSubworksAttributes').addEventListener('click', () => {
        setSubworksAttributes(document.getElementById('subwork_attribute').value);
        document.getElementById('id-edit-work.edit_note')
            .value = sidebar.editNote(GM_info.script, 'Set subworks attributes');
    });
    return false;
});
