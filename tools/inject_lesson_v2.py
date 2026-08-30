from pathlib import Path
p=Path('index.html')
s=p.read_text()
if 'lesson-v2.css' not in s:
    s=s.replace('</head>','  <link rel="stylesheet" href="lesson-v2.css?v=2">\n</head>')
if 'lesson-v2.js' not in s:
    s=s.replace('<script src="commentary.js"></script>','<script src="lesson-v2.js?v=2"></script>\n  <script src="commentary.js"></script>')
    if 'lesson-v2.js' not in s:
        s=s.replace('</body>','  <script src="lesson-v2.js?v=2"></script>\n</body>')
p.write_text(s)
print('Injected lesson-v2 assets')