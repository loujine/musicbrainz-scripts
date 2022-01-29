#!/usr/bin/env python3

import time
import unittest

from tests import UserscriptsTC

WORK_MBID = 'cc6eba78-85ef-3834-a400-a34e0d8856d9'
MAIN_WORK_MBID = 'db6400f0-6492-4c4a-9361-470be14d5bf2'
MAIN_WORK_MBID2 = '8f32fb44-fde9-4e44-ad54-d7ac12703b4f'
RECORDING_MBID = '4044dfc7-e7d4-48ca-98b4-d11e0692a21d'
CONDUCTOR_MBID = '642284f1-54ef-4d2c-b27e-a74bb02fe387'
RELEASE_MBID = '0a6a05dc-bc64-4090-923a-0faaefc591f5'


class DisplayUserscriptsTC(UserscriptsTC):

    def test_script_sortable_columns(self):
        self.login('work', WORK_MBID)
        self.load_userscript('mb-display_sortable_table.user.js')
        assert self.driver.find_element_by_id('loujine-sidebar')
        btn = self.driver.find_element_by_id('makeSortable')
        btn.click()
        assert self.driver.find_element_by_css_selector('th.sortable').text == 'Date↕'

        assert int(self.driver.find_element_by_css_selector('table.tbl tr.odd td').text[:4]) < 1950
        self.driver.find_element_by_css_selector('th.sortable').click()
        assert int(self.driver.find_element_by_css_selector('table.tbl tr.odd td').text[:4]) > 2018

    def test_script_acousticbrainz_data(self):
        self.login('recording', RECORDING_MBID)
        self.load_userscript('mb-display_acousticbrainz_data_for_recording.user.js')
        assert self.driver.find_element_by_id('loujine-sidebar')
        assert 'Beats count:' in self.driver.page_source
        assert self.driver.find_element_by_id('ABbeatcount')

    def test_script_count_alias(self):
        self.login('work', WORK_MBID)
        self.load_userscript('mb-display_count_alias.user.js')
        header = self.driver.find_element_by_css_selector("a[href$='/aliases']")
        time.sleep(5)
        assert 'background-color: rgb' in header.get_attribute('style')

    def test_script_acousticbrainz_dataset(self):
        self.login('work', WORK_MBID)
        self.load_userscript('mb-display_acousticbrainz_dataset_for_work.user.js')
        assert self.driver.find_element_by_id('loujine-sidebar')
        btn = self.driver.find_element_by_id('showABids')
        btn.click()
        headers = self.driver.find_elements_by_css_selector('th')
        assert 'ABrainz' in [h.text for h in headers]
        datasets = self.driver.find_elements_by_css_selector("a[href*='/acousticbrainz.org/']")
        assert len(datasets) > 10

    def test_script_work_relations_for_artist_recordings(self):
        self.login('artist', CONDUCTOR_MBID + '/relationships')
        self.load_userscript('mb-display_work_relations_for_artist_recordings.user.js')
        btn = self.driver.find_element_by_id('showMissingWorks')
        btn.click()

    def test_script_split_recordings(self):
        self.login('work', MAIN_WORK_MBID)
        self.load_userscript('mb-display_split_recordings.user.js')
        btn = self.driver.find_element_by_id('displaySubworkRecordings')
        btn.click()
        time.sleep(20)
        assert '(33:04)' in self.driver.page_source

    def test_script_split_recordings_no_rels(self):
        self.login('work', MAIN_WORK_MBID2)
        self.load_userscript('mb-display_split_recordings.user.js')
        btn = self.driver.find_element_by_id('displaySubworkRecordings')
        btn.click()
        time.sleep(35)
        assert '(23:34)' in self.driver.page_source

    def test_script_lean_ui(self):
        self.login('release', RELEASE_MBID)
        assert self.driver.find_element_by_css_selector(f"li > a[href$='{RELEASE_MBID}/details']")
        assert self.driver.find_element_by_css_selector(f"li > a[href$='{RELEASE_MBID}/tags']")
        assert self.driver.find_element_by_css_selector('th.rating').text
        assert self.driver.find_element_by_css_selector('h2.rating').text
        assert self.driver.find_element_by_css_selector('h2.reviews').text

        self.load_userscript('mb-display_lean_ui.user.js')
        assert not self.driver.find_elements_by_css_selector(f"li > a[href$='{RELEASE_MBID}/details']")
        assert not self.driver.find_elements_by_css_selector(f"li > a[href$='{RELEASE_MBID}/tags']")
        assert not self.driver.find_element_by_css_selector('th.rating').text
        assert not self.driver.find_element_by_css_selector('h2.rating').text
        assert not self.driver.find_element_by_css_selector('#toggle-release-information dl').is_displayed()
        assert not self.driver.find_element_by_css_selector('#toggle-additional-details dl').is_displayed()
        assert not self.driver.find_element_by_css_selector('#toggle-labels ul').is_displayed()
        assert not self.driver.find_element_by_css_selector('#toggle-release-events div').is_displayed()
        assert not self.driver.find_element_by_css_selector('#toggle-external-links ul').is_displayed()
        assert not self.driver.find_element_by_css_selector('h2.reviews').text


if __name__ == "__main__":
    unittest.main()
