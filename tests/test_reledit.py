#!/usr/bin/env python3

import time
import unittest

import pytest
from selenium.common.exceptions import NoAlertPresentException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

from tests import MBSERVER, UserscriptsTC

RELEASE_MBID = '57eac48b-da83-4be2-9328-4d350b255261'
RELEASE_WO_WORKS_MBID = '06cf52ff-747b-45b3-b928-2a987fa412c0'
RELEASE_WO_WORKS_MBID2 = '83a094b8-438e-4010-a36d-2790a3a92bee'
RELEASE_W_RELS_MBID = 'd5d4b955-2517-445a-bf1e-6efdb1279710'
RELEASE_W_RECRELS_MBID = '9e10cf78-0d27-3db9-a6cb-de45c5ca174e'
SMALL_RELEASE_MBID = 'a3bceee7-c9d9-4ce1-9fd4-5a47553a0305'
RECORDING_URL = f'{MBSERVER}/recording/91390a5d-317d-4012-80c9-314a139f4800'
RECORDING2_URL = f'{MBSERVER}/recording/d787eb84-37a4-4195-bbc9-93f7731140d4'
# WORK_MBID = 'cc6eba78-85ef-3834-a400-a34e0d8856d9'
MAIN_WORK_MBID = 'db6400f0-6492-4c4a-9361-470be14d5bf2'
# RECORDING_MBID = '4044dfc7-e7d4-48ca-98b4-d11e0692a21d'
# CONDUCTOR_MBID = '642284f1-54ef-4d2c-b27e-a74bb02fe387'
RECORDING_RELS_URL = f'{MBSERVER}/recording/54029746-25ba-4f88-9885-387ac581e45f'
RELEASE_RELS_URL = f'{MBSERVER}/release/{RELEASE_W_RECRELS_MBID}'


class ReleditUserscriptsTC(UserscriptsTC):

    def test_script_clone_ext_relations(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) == 0
        self.driver.find_element(By.ID, 'clone_rels_script_toggle').click()
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input').click()
        self.driver.find_element(By.ID, 'cloneExtRecording').send_keys(RECORDING_URL)
        time.sleep(5)
        self.driver.find_element(By.ID, 'cloneAR').click()
        time.sleep(5)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) > 1
        assert 'recorded at' in self.driver.find_element(
            By.CSS_SELECTOR, 'td.recording').text
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_clone_ext_recording_relations(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) == 0
        self.driver.find_element(By.ID, 'clone_rels_script_toggle').click()
        self.driver.find_elements(By.CSS_SELECTOR, 'td.recording input')[0].click()
        self.driver.find_element(By.ID, 'cloneExtRecording').send_keys(RECORDING_URL)
        time.sleep(5)
        self.driver.find_element(By.ID, 'cloneAR').click()
        time.sleep(5)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) > 1
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_clone_recording_relations(self):
        self.login('release', RELEASE_W_RECRELS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) == 0
        self.driver.find_element(By.ID, 'clone_rels_script_toggle').click()
        self.driver.find_element(By.CSS_SELECTOR, 'th.recordings input').click()
        self.driver.find_element(By.ID, 'cloneRef').send_keys('2')
        time.sleep(1)
        self.driver.find_element(By.ID, 'cloneAR').click()
        time.sleep(5)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) > 1
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_clone_multi_sources(self):
        self.login('release', RELEASE_W_RECRELS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) == 0
        self.driver.find_element(By.ID, 'clone_rels_script_toggle').click()
        self.driver.find_element(By.CSS_SELECTOR, 'th.recordings input').click()
        self.driver.find_element(By.ID, 'cloneRef').send_keys('1-2')
        time.sleep(1)
        self.driver.find_element(By.ID, 'cloneAR').click()
        time.sleep(2)
        assert 0 < len(set([node.text for node in self.driver.find_elements(
            By.CSS_SELECTOR, 'tr:not(.even) td.recording span.rel-add a')])) < 3
        assert 0 < len(set([node.text for node in self.driver.find_elements(
            By.CSS_SELECTOR, 'tr.even td.recording span.rel-add a')])) < 3
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_clone_release_relations(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) == 0
        assert len(self.driver.find_elements(
            By.CSS_SELECTOR, 'table.rel-editor-table td.relationship-list span.rel-add')) == 0
        self.driver.find_element(By.ID, 'clone_release_rels_script_toggle').click()
        self.driver.find_element(By.ID, 'cloneExtRelease').send_keys(RELEASE_RELS_URL)
        time.sleep(3)
        self.driver.find_element(By.ID, 'cloneReleaseAR').click()
        time.sleep(5)
        assert len(self.driver.find_elements(
            By.CSS_SELECTOR, 'table.rel-editor-table td.relationship-list span.rel-add')) == 1
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_clone_GH_28(self):
        # check the relation direction is kept
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) == 0
        assert not self.driver.page_source.count('samples of')
        count_backward = self.driver.page_source.count('sampled by')
        self.driver.find_element(By.ID, 'clone_rels_script_toggle').click()
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input').click()
        self.driver.find_element(By.ID, 'cloneExtRecording').send_keys(RECORDING_RELS_URL)
        time.sleep(3)
        self.driver.find_element(By.ID, 'cloneAR').click()
        time.sleep(4)
        assert len(self.driver.find_elements(By.CLASS_NAME, 'rel-add')) > 1
        assert not self.driver.page_source.count('samples of')
        assert self.driver.page_source.count('sampled by') == count_backward + 1
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_remove_dates(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-copy_dates.user.js')
        time.sleep(2)
        assert self.driver.page_source.count('on 2016-04-07') > 1
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input.recording').click()
        self.driver.find_element(By.ID, 'removeDates').click()
        time.sleep(1)
        assert 'on 2016-04-07' not in self.driver.page_source
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_copy_dates(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-copy_dates.user.js')
        time.sleep(2)
        assert self.driver.page_source.count('on 2016-04-07') > 1
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input.recording').click()
        self.driver.find_element(By.ID, 'removeDates').click()
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording .remove-item').click()
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording .remove-item').click()
        time.sleep(1)
        assert self.driver.page_source.count('on 2016-04-07') == 1
        self.driver.find_element(By.ID, 'replaceDates').click()
        self.driver.find_element(By.ID, 'copyDates').click()
        time.sleep(1)
        assert self.driver.page_source.count('on 2016-04-07') > 1
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_guess_works(self):
        self.login('release', RELEASE_WO_WORKS_MBID2 + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)
        assert 'Search for works' in self.driver.page_source
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list')) == 1

        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input').click()
        self.driver.find_element(By.ID, 'searchWork').click()
        time.sleep(5)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 1
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    @pytest.mark.skip(reason="")
    def test_script_guess_main_works(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(2)

        # no repeats
        self.driver.find_element(By.CSS_SELECTOR, 'th.recordings input').click()
        self.driver.find_element(By.ID, 'mainWork').send_keys(MAIN_WORK_MBID)
        time.sleep(1)
        self.driver.find_element(By.ID, 'fetchSubworks').click()
        time.sleep(6)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 4
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    @pytest.mark.skip(reason="")
    def test_script_guess_repeated_subworks(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, 'th.recordings input').click()
        self.driver.find_element(By.ID, 'mainWork').send_keys(MAIN_WORK_MBID)
        time.sleep(1)

        # partial repeats
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list')) == 0
        self.driver.find_element(By.ID, 'repeats').send_keys('1,1,2,1')
        time.sleep(1)
        self.driver.find_element(By.ID, 'fetchSubworks').click()
        time.sleep(4)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 5
        assert ['partial' in node.text for node in self.driver.find_elements(
            By.CSS_SELECTOR, 'td.relationship-list span.rel-add')] == [False, False, True, True, False]
        for node in self.driver.find_elements(By.CSS_SELECTOR, 'tr.recording-of button.remove-item'):
            node.click()
        time.sleep(2)

        # missing repeats
        self.driver.find_element(By.ID, 'repeats').clear()
        self.driver.find_element(By.ID, 'repeats').send_keys('1,1,0,1')
        time.sleep(1)
        self.driver.find_element(By.ID, 'fetchSubworks').click()
        time.sleep(3)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 3
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    @pytest.mark.skip(reason="")
    def test_script_guess_overlapping_subworks(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(2)
        self.driver.find_element(By.CSS_SELECTOR, 'th.recordings input').click()
        self.driver.find_element(By.ID, 'mainWork').send_keys(MAIN_WORK_MBID)
        time.sleep(1)

        # overlapping repeats
        self.driver.find_element(By.ID, 'repeats').clear()
        self.driver.find_element(By.ID, 'repeats').send_keys('1,1,-1,1')
        time.sleep(2)
        self.driver.find_element(By.ID, 'fetchSubworks').click()
        time.sleep(4)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 4
        assert [len(node.find_elements(By.CSS_SELECTOR, 'h3 > .remove-item'))
                for node in self.driver.find_elements(By.CSS_SELECTOR, 'td.works')][:3] == [1, 2, 1]
        assert not any(
            ['partial' in node.text for node in self.driver.find_elements(
                By.CSS_SELECTOR, 'td.relationship-list span.rel-add')])
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_release_rels(self):
        self.login('release', RELEASE_W_RELS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-release_rel_to_recording_rel.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 0
        self.driver.find_element(By.CSS_SELECTOR, 'input.recording').click()
        self.driver.find_element(By.ID, 'moveAR').click()
        time.sleep(1)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'td.relationship-list span.rel-add')) == 4
        assert len(self.driver.find_elements(
            By.CSS_SELECTOR, 'table.rel-editor-table td.relationship-list span.rel-remove')) == 4
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_set_instruments(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_instruments.user.js')
        time.sleep(1)
        count_from = self.driver.page_source.count('orchestra')
        count_to = self.driver.page_source.count('remixer')
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input').click()
        self.driver.find_element(By.ID, 'instrument_script_toggle').click()
        select = Select(self.driver.find_element(By.ID, 'fromRole'))
        select.select_by_visible_text('  orchestra')
        select = Select(self.driver.find_element(By.ID, 'toRole'))
        select.select_by_visible_text('  remixer')
        self.driver.find_element(By.ID, 'setRole').click()
        time.sleep(1)
        assert self.driver.page_source.count('orchestra') < count_from
        assert self.driver.page_source.count('remixer') > count_to
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_relation_attrs(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_relation_attrs.user.js')
        time.sleep(1)
        assert '(live)' not in self.driver.page_source
        self.driver.find_element(By.ID, 'relattrs_script_toggle').click()

        # set live from recording checkbox
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input').click()
        self.driver.find_element(By.ID, 'setLive').click()
        time.sleep(1)
        assert '(live)' in self.driver.page_source

        # set partial from second work checkbox
        self.driver.find_elements(By.CSS_SELECTOR, 'td.works input')[1].click()
        self.driver.find_element(By.ID, 'setPartial').click()
        time.sleep(1)
        assert '(live)' not in self.driver.page_source
        assert '(live and partial)' in self.driver.page_source

        # unset live from second work checkbox
        self.driver.find_element(By.ID, 'toggleLive').click()
        time.sleep(1)
        assert '(live)' not in self.driver.page_source
        assert '(live and partial)' not in self.driver.page_source
        assert '(partial)' in self.driver.page_source
        assert self.driver.find_element(By.ID, 'edit-note-text').text

    def test_script_set_writer(self):
        self.login('release', SMALL_RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_rec_artist_as_writer.user.js')
        time.sleep(2)
        # assert not len(self.driver.find_elements(By.CSS_SELECTOR, 'tr.composer'))
        self.driver.find_element(By.CSS_SELECTOR, 'td.recording input').click()
        self.driver.find_element(By.ID, 'setWriter').click()
        time.sleep(2)
        assert len(self.driver.find_elements(By.CSS_SELECTOR, 'tr.composer'))
        assert 'composer:\nAttacca Quartet' in self.driver.find_element(By.CSS_SELECTOR, 'tr.composer').text

    def tearDown(self):
        super().tearDown()
        try:
            self.driver.switch_to.alert.accept()
        except NoAlertPresentException:
            pass


if __name__ == "__main__":
    unittest.main()
