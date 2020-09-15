# Musicbrainz scripts

Collection of greasemonkey scripts I wrote for [MusicBrainz](https://musicbrainz.org) display and editing.

Contact me for bug reports/suggestions/patches: [loujine](https://github.com/loujine/) on github, [loujin](https://musicbrainz.org/user/loujin) on Musicbrainz (sadly 'loujine' was already taken)


## Compatibility

Scripts are tested with the latest stable version of Firefox and Tampermonkey.
They should work with most recent browsers and with ViolentMonkey, but are not
compatible with Greasymonkey 4 since December 2017.

Historical note: this repo was first a mercurial repo on bitbucket (mirrored as a git repo on github); now that bitbucket has removed mercurial support, github is the home of the repo and the bitbucket repo is outdated.

Historical note 2: scripts were also hosted on Greasyfork but were removed there
in summer 2020. If you installed scripts through Greasyfork, make sure they can
update to versions using github in @updateURL or reinstall them.

## Content

Documentation was moved to a [wiki](https://bitbucket.org/loujine/musicbrainz-scripts/wiki/Home).

[Screenshots and some explanations](https://bitbucket.org/loujine/musicbrainz-scripts/wiki/documentation.rst)

Discussions on these scripts sometimes take place on the [musicbrainz forums](https://community.metabrainz.org/tags/userscripts).

## Installing

For installation, follow the [Greasemonkey manual](https://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts)

### Scripts to add/modify information display

#### Display (missing) work relations for an artist recordings

Mark recordings not linked to any work on an artist recordings or relationships page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_work_relations_for_artist_recordings.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_work_relations_for_artist_recordings.user.js)

#### Display AcousticBrainz data on recording page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_acousticbrainz_data_for_recording.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_acousticbrainz_data_for_recording.user.js)

#### Display AcousticBrainz datasets count for work

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_acousticbrainz_dataset_for_work.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_acousticbrainz_dataset_for_work.user.js)

#### Display RG timeline

Display release groups timeline on artist overview page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_rg_timeline.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_rg_timeline.user.js)

#### Display alias count

Display alias count on work/artist pages

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_count_alias.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_count_alias.user.js)

#### Display sort button on table columns

Make table columns sortable

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_sortable_table.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_sortable_table.user.js)

#### Show recordings of subworks on Work page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-display_split_recordings.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_split_recordings.user.js)

### Scripts to edit entities

#### MusicBrainz edit: Add entity aliases in batch

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-add_aliases.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-add_aliases.user.js)

#### MusicBrainz edit: Create entity or fill data from wikipedia / wikidata / VIAF / ISNI

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-create_from_wikidata.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_from_wikidata.user.js)

#### MusicBrainz edit: Create work arrangement from existing work

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-create_work_arrangement.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_work_arrangement.user.js)

#### MusicBrainz edit: Display acoustIDs and merge recordings with common acoustID

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-merge_from_acoustid.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-merge_from_acoustid.user.js)

#### MusicBrainz edit: Replace recording artists from a Release page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-replace_rec_artist_from_release_page.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-replace_rec_artist_from_release_page.user.js)

#### MusicBrainz edit: Replace recording artists from an Artist or Work page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-replace_rec_artist_from_work_page.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-replace_rec_artist_from_work_page.user.js)

#### MusicBrainz edit: Replace subwork titles and attributes in Work edit page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-edit_subworks.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js)

#### MusicBrainz edit: Set recording names as work aliases

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-set_work_aliases.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_work_aliases.user.js)

#### MusicBrainz edit: Set work attributes from the composer Work page

Set attributes (type, lang, key) from the composer Work page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-set_work_attributes.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_work_attributes.user.js)

#### MusicBrainz event editor: Fill event setlist

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-fill_event_setlist.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-fill_event_setlist.user.js)

#### MusicBrainz recording: Create broadcast release from the current recording

Create a "Broadcast" release containing the current recording

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-create_release_from_recording.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_release_from_recording.user.js)

#### MusicBrainz recording: Seed concert event from recording

Seed a "Concert" event with the same content as the current recording

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-edit-seed_event_from_recording.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-seed_event_from_recording.user.js)

#### Merge recordings from acoustID page

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/acoustid-merge-recordings.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/acoustid-merge-recordings.user.js)

### Scripts to edit relations

#### MusicBrainz relation editor: Copy dates on recording relations

Copy/remove dates on recording relations

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-reledit-copy_dates.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-copy_dates.user.js)

#### MusicBrainz relation editor: Guess related works in batch

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-reledit-guess_works.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-guess_works.user.js)

#### MusicBrainz relation editor: Replace release relations by recording relations

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-reledit-release_rel_to_recording_rel.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-release_rel_to_recording_rel.user.js)

#### MusicBrainz relation editor: Set relation attributes

Set attributes (live, partial, solo...)

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-reledit-set_relation_attrs.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_relation_attrs.user.js)

#### MusicBrainz relation editor: set role in recording-artist relation

Set/unset role relations on selected recordings

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-reledit-set_instruments.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_instruments.user.js)

### Importer scripts

Importer scripts should be installed from [https://raw.githubusercontent.com/murdos/musicbrainz-userscripts](murdos's repo) when possible (e.g. Naxos Library)

#### Import Hyperion/Helios releases to MusicBrainz

Add a button to import Hyperion/Helios releases to MusicBrainz

[![Source](https://raw.github.com/jerone/UserScripts/master/_resources/Source-button.png)](https://github.com/loujine/musicbrainz-scripts/blob/master/mb-importer-hyperion.user.js)
[![Install](https://raw.github.com/jerone/UserScripts/master/_resources/Install-button.png)](https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-importer-hyperion.user.js)

## Contributors

[List of contributors](https://github.com/loujine/musicbrainz-scripts/graphs/contributors)

… and thanks to many MusicBrainz editors/MetaBrainz developers for suggestions and feedback.

!m everyone

## License

[MIT](https://opensource.org/licenses/MIT)

## Reporting bugs & Contributing

Please submit all patches to [github](https://github.com/loujine/musicbrainz-scripts/pulls) for review.
