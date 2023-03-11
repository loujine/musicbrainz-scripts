#!/usr/bin/env python3

import time
import unittest

from selenium.webdriver.support.ui import Select

from tests import UserscriptsTC

ARTIST_MBID = 'cea4a3b8-c26c-4b61-a243-cf72555e2c71'
RELEASE_MBID = '0381e8bd-29d3-4fa1-bf8a-e8b1d87ff531'
RECORDING_MBID = '4b86f0bf-be35-4c78-a554-80f795c020aa'
WIKIDATA_LINK = 'https://www.wikidata.org/wiki/Q27916341'
WORK_WITH_SW_MBID = 'cbfca1d7-30de-4d40-967b-f7bc4c2e3176'


class EditUserscriptsTC(UserscriptsTC):

    def test_script_seed_event(self):
        self.login('recording', RECORDING_MBID)
        self.load_userscript('mb-edit-seed_event_from_recording.user.js')
        self.driver.find_element_by_id('createConcert').click()
        time.sleep(8)
        self.driver.switch_to.window(self.driver.window_handles[-1])
        assert 'event/create' in self.driver.current_url
        assert self.driver.find_element_by_id('id-edit-event.setlist').text
        assert 'held at:' in self.driver.page_source
        assert 'main performers:' in self.driver.page_source
        assert 'recording location for:' in self.driver.page_source

    def test_script_set_video(self):
        self.login('release', RELEASE_MBID)
        self.load_userscript('mb-edit-set_video_recordings.user.js')
        self.driver.find_element_by_id('video_script_toggle').click()
        time.sleep(2)
        assert len(self.driver.find_elements_by_class_name('replacevideo')) > 1
        self.driver.find_element_by_id('video-68eec263-13e4-4a5f-8042-23117714cdce').click()
        # self.driver.set_network_conditions(offline=True, latency=1000, throughput=500 * 1024)
        # self.driver.find_element_by_id('batch_video').click()
        # time.sleep(1)
        # assert 'Fetching required data' in self.driver.page_source

    def test_script_wikidata(self):
        self.login('artist', ARTIST_MBID + '/edit')
        self.load_userscript('mb-edit-create_from_wikidata.user.js')
        time.sleep(1)
        assert 'Add external link' in self.driver.page_source
        assert len(self.driver.find_elements_by_class_name('url')) > 18
        self.driver.find_element_by_id('linkParser').send_keys(WIKIDATA_LINK)
        time.sleep(1)
        assert '<dt>Field "Name":</dt>' in self.driver.page_source
        assert '<dd>Kept "Víkingur Ólafsson"</dd>' in self.driver.page_source
        assert 'New external link added' in self.driver.page_source
        assert 'teacher suggestion' in self.driver.page_source

    def test_script_set_aliases(self):
        self.login('artist', ARTIST_MBID + '/aliases')
        self.load_userscript('mb-edit-add_aliases.user.js')
        assert 'Add a new row' in self.driver.page_source
        self.driver.find_element_by_id('addRow').click()
        time.sleep(1)
        lang = [o.text for o in self.driver.find_elements_by_class_name('language')]
        assert sorted(lang) == lang
        select = Select(self.driver.find_element_by_css_selector('tr.newAlias select'))
        select.select_by_visible_text('Legal name')
        assert self.driver.find_element_by_css_selector(
            'tr.newAlias select').get_attribute('selectedIndex') == '2'
        self.driver.find_element_by_id('addRow').click()
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('newAlias')) == 2
        # remove first (modified) row
        self.driver.find_element_by_class_name('deleteRow').click()
        time.sleep(1)
        # row 1 is now the former row 2 (i.e. empty)
        assert self.driver.find_element_by_css_selector(
            'tr.newAlias select').get_attribute('selectedIndex') == '0'

    def test_script_edit_subworks(self):
        self.login('work', WORK_WITH_SW_MBID + '/edit')
        self.load_userscript('mb-edit-edit_subworks.user.js')
        time.sleep(1)
        assert '(movement)' in self.driver.page_source

        select = Select(self.driver.find_element_by_id('subwork_attribute'))
        select.select_by_visible_text('act')
        self.driver.find_element_by_id('setSubworksAttributes').click()
        time.sleep(1)
        assert '(movement)' not in self.driver.page_source
        assert '(act and movement)' in self.driver.page_source

        select.select_by_visible_text('movement')
        self.driver.find_element_by_id('setSubworksAttributes').click()
        time.sleep(1)
        assert '(act and movement)' not in self.driver.page_source
        assert '(act)' in self.driver.page_source


if __name__ == "__main__":
    unittest.main()
