import shutil
import unittest
from radar.site import build_site
from tests.helpers import temp_config

class SiteBoundaryTests(unittest.TestCase):
 def test_drama_site_excludes_legacy_novel_pages(self):
  config=temp_config();self.addCleanup(shutil.rmtree,config.paths.root)
  novel=config.paths.web/'novel';novel.mkdir(exist_ok=True);(novel/'snapshot.json').write_text('private assessment')
  out=config.paths.root/'_site';build_site(config,out,[],log=lambda _:None)
  self.assertTrue((out/'index.html').exists())
  self.assertFalse((out/'novel').exists())
  self.assertTrue((novel/'snapshot.json').exists())
