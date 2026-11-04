"""Optional independent PDF QA. Requires PyMuPDF + fontTools; not runtime dependencies."""
import pathlib,sys
import fitz
from fontTools.ttLib import TTFont
file=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'artifacts/bao-cao-minh-hoa.pdf')
doc=fitz.open(file)
assert len(doc)>4
for n,page in enumerate(doc,1):
 assert abs(page.rect.width-595.28)<1 and abs(page.rect.height-841.89)<1,(n,'not A4')
 text=page.get_text()
 assert len(text.strip())>50,(n,'unexpected blank page')
 assert '\ufffd' not in text,(n,'invalid replacement glyph')
 for block in page.get_text('dict')['blocks']:
  for line in block.get('lines',[]):
   for span in line['spans']:
    x0,y0,x1,y1=span['bbox']
    assert x0>=0 and y0>=0 and x1<page.rect.width+1 and y1<page.rect.height+1,(n,'text outside page',span['text'])
alltext='\n'.join(page.get_text() for page in doc)
for phrase in ['TỬ VI ĐẨU SỐ','Mục lục','Phụ lục','Chính tinh','UNVERIFIED']:
 assert phrase in alltext,phrase
font=TTFont('public/fonts/Report.ttf');cmap=font.getBestCmap()
assert all(ord(c) in cmap for c in 'Tử Vi Đẩu Số Tiếng Việt Ắ Ỹ ệ ộ 紫微天府')
print(f'Independent PDF QA passed: {len(doc)} A4 pages; Vietnamese/CJK font; no blanks, replacement glyphs or overflow.')
