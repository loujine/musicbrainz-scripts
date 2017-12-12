/* global $ GM_addStyle GM_getResourceText Handlebars vis */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display release timeline
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.12.9
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-release_timeline.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-release_timeline.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: display release timeline
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/vis/4.20.1/vis.js
// @resource     viscss https://cdnjs.cloudflare.com/ajax/libs/vis/4.20.1/vis-timeline-graph2d.min.css
// @require      https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js
// @resource     slickcss https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.css
// @resource     slicktheme https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.css
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

$('div#filter').after(`
    <div style="width: 800px;">
      <h3>Carousel</h3>
      <div id="slider" class="slider multiple-items"></div>
    </div>
    <div id="timeline">
      <h3>Timeline</h3>
    </div>
`);

$(document).ready(function () {
    const data = [];
    $('.release-group-list tbody tr').each(function (idx, row) {
        const mbid = row.children[2].children[0].href.split('/')[4],
            year = row.children[1].textContent,
            cover_url =  `https://coverartarchive.org/release-group/${mbid}/front-250.jpg`,
            rg_url = `https://musicbrainz.org/release-group/${mbid}`;
        let artists = '';

        $('div#slider').append(
            `<div>
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

    $('.multiple-items').slick({
        arrows: true,
        centerMode: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
    });
    $('.slick-arrow').css('background-color', 'black');
    new vis.Timeline(
        document.getElementById('timeline'),
        new vis.DataSet(data),
        {
            template: template,
            editable: false
        }
    );
    return false;
});
