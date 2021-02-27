#!/usr/bin/env python3

import time
import unittest

from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoAlertPresentException

from tests import MBSERVER, UserscriptsTC

RELEASE_MBID = '57eac48b-da83-4be2-9328-4d350b255261'
RECORDING_URL = '{MBSERVER}/recording/91390a5d-317d-4012-80c9-314a139f4800'
# WORK_MBID = 'cc6eba78-85ef-3834-a400-a34e0d8856d9'
# MAIN_WORK_MBID = 'db6400f0-6492-4c4a-9361-470be14d5bf2'
# RECORDING_MBID = '4044dfc7-e7d4-48ca-98b4-d11e0692a21d'
# CONDUCTOR_MBID = '642284f1-54ef-4d2c-b27e-a74bb02fe387'
RECORDING_RELS_URL = f'{MBSERVER}/recording/54029746-25ba-4f88-9885-387ac581e45f'


class ReleditUserscriptsTC(UserscriptsTC):

    def test_script_clone_ext_relations(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('rel-add')) == 1
        self.driver.find_element_by_id('clone_rels_script_toggle').click()
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('cloneExtRecording').send_keys(RECORDING_URL)
        time.sleep(1)
        self.driver.find_element_by_id('cloneAR').click()
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('rel-add')) > 1

    def test_script_clone_GH_28(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('rel-add')) == 1
        assert not self.driver.page_source.count('samples of')
        count_backward = self.driver.page_source.count('sampled by')
        self.driver.find_element_by_id('clone_rels_script_toggle').click()
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('cloneExtRecording').send_keys(RECORDING_RELS_URL)
        time.sleep(1)
        self.driver.find_element_by_id('cloneAR').click()
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('rel-add')) > 1
        assert not self.driver.page_source.count('samples of')
        assert self.driver.page_source.count('sampled by') == count_backward + 3

    def test_script_remove_dates(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-copy_dates.user.js')
        time.sleep(1)
        assert self.driver.page_source.count('>2016-04-07<') > 1
        assert len(self.driver.find_elements_by_class_name('rel-edit')) == 2
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('removeDates').click()
        assert '>2016-04-07<' not in self.driver.page_source
        assert len(self.driver.find_elements_by_class_name('rel-edit')) > 2

    def test_script_copy_dates(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-copy_dates.user.js')
        time.sleep(1)
        assert self.driver.page_source.count('>2016-04-07<') > 1
        assert len(self.driver.find_elements_by_class_name('rel-edit')) == 2
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('removeDates').click()
        self.driver.find_element_by_class_name('remove-button').click()
        self.driver.find_element_by_class_name('remove-button').click()
        assert self.driver.page_source.count('>2016-04-07<') == 1
        self.driver.find_element_by_id('copyDates').click()
        assert self.driver.page_source.count('>2016-04-07<') > 1

    def test_script_guess_works(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)
        assert 'Search for works' in self.driver.page_source
        # TODO

    def test_script_release_rels(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-release_rel_to_recording_rel.user.js')
        time.sleep(1)
        # TODO

    def test_script_set_instruments(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_instruments.user.js')
        time.sleep(1)
        count_from = self.driver.page_source.count('orchestra')
        count_to = self.driver.page_source.count('remixer')
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('instrument_script_toggle').click()
        select = Select(self.driver.find_element_by_id('fromRole'))
        select.select_by_visible_text('  orchestra')
        select = Select(self.driver.find_element_by_id('toRole'))
        select.select_by_visible_text('  remixer')
        self.driver.find_element_by_id('setRole').click()
        assert self.driver.page_source.count('orchestra') < count_from
        assert self.driver.page_source.count('remixer') > count_to

    def test_script_relation_attrs(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_relation_attrs.user.js')
        time.sleep(1)
        assert '>live recording of<' not in self.driver.page_source
        self.driver.find_element_by_id('relattrs_script_toggle').click()
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('setLive').click()
        assert '>live recording of<' in self.driver.page_source
        self.driver.find_element_by_id('toggleLive').click()
        assert '>live recording of<' not in self.driver.page_source

    def tearDown(self):
        super().tearDown()
        try:
            self.driver.switch_to.alert.accept()
        except NoAlertPresentException:
            pass


if __name__ == "__main__":
    unittest.main()
