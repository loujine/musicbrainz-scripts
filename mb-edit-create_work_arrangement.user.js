/* global $ requests edits server sidebar helper GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Create work arrangement from existing work
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.12
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_work_arrangement.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_work_arrangement.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Create work arrangement from existing work
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/create
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function createArrangement(mbid, parentMbid) {
    $('#create-arrangement-text').empty();
    fetch(helper.wsUrl('work', ['artist-rels', 'work-rels'], mbid))
        .then(resp => resp.json())
        .then(function(data) {
            const editData = {
                name: data.title,
                type_id: server.workType[data.type],
                languages: data.languages.map(l => server.languageFromISO[l]),
                attributes: [],
                relations: data.relations,
            };
            data.attributes.forEach(function (attr) {
                if (attr.type === 'Key') {
                    editData.attributes.push({
                        type_id: 1,
                        value: server.workKeyAttr[attr.value],
                    })
                }
            });
            const postData = edits.prepareEdit(editData);
            const wlt = server.workLinkType;
            let idx = 0;
            editData.relations.forEach(function (rel) {
                if (rel['target-type'] === 'artist' && wlt[rel.type]) {
                    postData[`rel.${idx}.target`] = rel.artist.id;
                    postData[`rel.${idx}.backward`] = 1;
                    postData[`rel.${idx}.link_type_id`] = wlt[rel.type];
                    idx += 1;
                }
            });
            if (parentMbid) {
                postData[`rel.${idx}.target`] = parentMbid;
                postData[`rel.${idx}.backward`] = 1;
                postData[`rel.${idx}.link_type_id`] = wlt.subwork;
                idx += 1;
            }
            postData[`rel.${idx}.target`] = mbid;
            postData[`rel.${idx}.entity0_credit`] = '';
            postData[`rel.${idx}.entity1_credit`] = '';
            postData[`rel.${idx}.backward`] = 1;
            postData[`rel.${idx}.link_type_id`] = wlt.arrangement;
            postData.edit_note = sidebar.editNote(GM_info.script);
            postData.comment = document.getElementById('disambiguation').value;
            console.info('Data ready to be posted: ', postData);

            function success(xhr) {
                const newMbid = helper.mbidFromURL(xhr.responseURL);
                let editId = new RegExp(
                    '/edit/(\\d+)">edit</a>'
                ).exec(xhr.responseText);
                if (editId && editId.length) {
                    $('#create-arrangement-text').append(
                        '<a href="/edit/' + editId[1]
                        + '" target="_blank">edit ' + editId[1] + '</a>');
                } else if (editId === null) {
                    editId = new RegExp(
                        'Thank you, your.* href="(.*)">edits</a> (.*) have'
                    ).exec(xhr.responseText);
                    if (editId && editId.length) {
                        $('#create-arrangement-text').append(
                            '<a href="' + editId[1]
                            + '" target="_blank">' + editId[2] + '</a>');
                    }
                }
                if (document.getElementById('subworks').checked) {
                    idx = 0;
                    editData.relations.forEach(function (rel) {
                        if (rel.type === 'parts'
                            && rel.direction === "forward") {
                            setTimeout(function () {
                                createArrangement(rel.work.id, newMbid);
                            }, idx * server.timeout);
                            idx += 1;
                        }
                    });
                }
            }
            $('#create-arrangement-text').text('Creating arrangement(s)');
            requests.POST(
                '/work/create',
                edits.formatEdit('edit-work', postData),
                success
            );
        });
}


(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3><span id="work_arrangement_script_toggle">▶ Create work arrangement</span></h3>
        <div id="work_arrangement_script_block" style="display:none;">
        <input type="text" id="disambiguation" value="" placeholder="disambiguation text">
        <div>
          <label>Also create arr. for subworks</label>
          <input type="checkbox" id="subworks" value="">
        </div>
        <input type="button" id="create-arrangement" value="Apply" disabled="true">
        <span id="create-arrangement-text">
        </div>
    `);
    $('div#loujine-menu').css('margin-left', '550px');
})();


$(document).ready(function () {
    document.getElementById('work_arrangement_script_toggle').addEventListener('click', () => {
        const header = document.getElementById('work_arrangement_script_toggle');
        const block = document.getElementById('work_arrangement_script_block');
        const display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });
    $('#disambiguation').keydown(function () {
        $('#create-arrangement').prop('disabled', false);
    });
    $('#create-arrangement').click(function () {
        createArrangement(helper.mbidFromURL());
    });
    return false;
});
