/* global $ GM_addStyle GM_getResourceText Handlebars vis */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display RG timeline
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.8.15
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_rg_timeline.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_rg_timeline.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: display release groups timeline on artist overview page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.6/handlebars.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.js
// @resource     viscss https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis-timeline-graph2d.min.css
// @require      https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js
// @resource     slickcss https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.css
// @resource     slicktheme https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.css
// @include      http*://*musicbrainz.org/artist/*
// @exclude      http*://*musicbrainz.org/artist/create
// @exclude      http*://*musicbrainz.org/artist/*/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @run-at       document-end
// ==/UserScript==

GM_addStyle(GM_getResourceText("viscss"));
GM_addStyle(GM_getResourceText("slickcss"));
GM_addStyle(GM_getResourceText("slicktheme"));

const template = Handlebars.compile(`
  <div>
    <a href="{{rg_url}}">{{album}}</a>
    <br />
    {{artists}}
    <br />
    <img src="{{cover_url}}" width="150" height="150">
  </div>
`);

document.querySelector('div.filter').insertAdjacentHTML('afterend', `
    <div>
      <h3><span id="timeline_toggle">▶ Timeline</span></h3>
      <div id="timeline_block" style="display:none;">
      </div>
    </div>
`);

$(document).ready(function () {
    const data = [];
    document.getElementById('timeline_toggle').addEventListener('click', () => {
        const header = document.getElementById('timeline_toggle'),
            block = document.getElementById('timeline_block'),
            display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });

    document.querySelectorAll('h3 + .release-group-list').forEach((node, idx) => {
        node.insertAdjacentHTML('beforebegin', `
          <div style="width: 700px;">
            <div id="slider${idx}" class="slider multiple-items"></div>
          </div>
        `);

      node.querySelectorAll('tbody tr').forEach(row => {
            const mbid = row.children[2].children[0].href.split('/')[4],
                year = row.children[1].textContent,
                cover_url =  `https://coverartarchive.org/release-group/${mbid}/front-250.jpg`,
                rg_url = `https://musicbrainz.org/release-group/${mbid}`;
            let artists = '';

            document.getElementById(`slider${idx}`).insertAdjacentHTML('beforeend', `
                <div>
                  <a href="${rg_url}">
                    <img src="${cover_url}" width="150" height="150">
                  </a>
                  <p style="text-align: center;">${year}</p>
                </div>`
            );

            if (row.length == 6) {
                artists = row.children[3].textContent;
            }
            data.push({
                start: row.children[1].textContent,
                album: row.children[2].textContent,
                artists: artists,
                cover_url: cover_url,
                rg_url: `https://musicbrainz.org/release-group/${mbid}`
            });
        });
    });

    $('.multiple-items').slick({
        arrows: true,
        centerMode: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 2,
    });
    $('.slick-arrow').css('background-color', 'black');

    new vis.Timeline(  // eslint-disable-line no-new
        document.getElementById('timeline_block'),
        new vis.DataSet(data),
        {
            template: template,
            editable: false
        }
    );
    return false;
});
