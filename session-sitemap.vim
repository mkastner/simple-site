let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/projects/node.js/simple-site
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +1 term://~/projects/node.js/simple-site//34361:vifm\ \ \ /Users/kastner/projects/node.js/simple-site\ \ \'--choose-files\'\ \'/var/folders/_z/_n_4w_9d1vn43s9d_zylb68m0000gn/T/nvim.kastner/AwuGG3/4\'\ \'--on-choose\'\ \'echo\ \$VIFM_OPEN_TYPE\ >/var/folders/_z/_n_4w_9d1vn43s9d_zylb68m0000gn/T/nvim.kastner/AwuGG3/5\'\ \'+command\ EditVim\ \ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'edit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ VsplitVim\ :let\ \$VIFM_OPEN_TYPE=\'/\'\'vsplit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ SplitVim\ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'split\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ DiffVim\ \ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'vert\ diffsplit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ PeditVim\ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'pedit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ TabVim\ \ \ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'tablast\ \|\ tab\ drop\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'
badd +69 lib/build/sitemap.js
badd +161 lib/build/page.js
badd +7 lib/utils/dir-locations.js
badd +21 lib/build/site.js
badd +1 lib/utils/paths-store.js
badd +1 test/lib/build-sitemap.test.js
badd +42 test/lib/build/sitemap.test.js
badd +4 test/lib/utils/build-path-content.test.js
badd +42 package.json
badd +5 lib/router/contact.js
badd +231 site-backup/index.layout.handlebars
badd +1 lib/utils/traverse-directory.js
badd +9 lib/utils/handlebars/sitemap.hbs
badd +10 lib/utils/event.js
badd +5 lib/utils/ensure-dist-page-assets.js
badd +27 site/index.menu.json
badd +10 site/index.template.hbs
argglobal
%argdel
edit lib/utils/traverse-directory.js
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd _ | wincmd |
split
1wincmd k
wincmd w
wincmd w
wincmd _ | wincmd |
split
1wincmd k
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe '1resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 1resize ' . ((&columns * 82 + 83) / 166)
exe '2resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 2resize ' . ((&columns * 82 + 83) / 166)
exe '3resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 3resize ' . ((&columns * 83 + 83) / 166)
exe '4resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 4resize ' . ((&columns * 83 + 83) / 166)
argglobal
balt lib/build/sitemap.js
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=1
setlocal fml=1
setlocal fdn=10
setlocal nofen
let s:l = 47 - ((21 * winheight(0) + 17) / 34)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 47
normal! 025|
wincmd w
argglobal
if bufexists(fnamemodify("lib/build/sitemap.js", ":p")) | buffer lib/build/sitemap.js | else | edit lib/build/sitemap.js | endif
if &buftype ==# 'terminal'
  silent file lib/build/sitemap.js
endif
balt term://~/projects/node.js/simple-site//34361:vifm\ \ \ /Users/kastner/projects/node.js/simple-site\ \ \'--choose-files\'\ \'/var/folders/_z/_n_4w_9d1vn43s9d_zylb68m0000gn/T/nvim.kastner/AwuGG3/4\'\ \'--on-choose\'\ \'echo\ \$VIFM_OPEN_TYPE\ >/var/folders/_z/_n_4w_9d1vn43s9d_zylb68m0000gn/T/nvim.kastner/AwuGG3/5\'\ \'+command\ EditVim\ \ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'edit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ VsplitVim\ :let\ \$VIFM_OPEN_TYPE=\'/\'\'vsplit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ SplitVim\ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'split\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ DiffVim\ \ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'vert\ diffsplit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ PeditVim\ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'pedit\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'\ \'+command\ TabVim\ \ \ \ :let\ \$VIFM_OPEN_TYPE=\'/\'\'tablast\ \|\ tab\ drop\'/\'\'\ \|\ execute\ \'/\'\'cnoremap\ j\ \<cr>\'/\'\'\ \|\ normal\ gs:editj\'
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=1
setlocal fml=1
setlocal fdn=10
setlocal nofen
let s:l = 69 - ((24 * winheight(0) + 17) / 34)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 69
normal! 036|
wincmd w
argglobal
if bufexists(fnamemodify("site/index.menu.json", ":p")) | buffer site/index.menu.json | else | edit site/index.menu.json | endif
if &buftype ==# 'terminal'
  silent file site/index.menu.json
endif
balt lib/utils/handlebars/sitemap.hbs
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=1
setlocal fml=1
setlocal fdn=10
setlocal nofen
let s:l = 21 - ((19 * winheight(0) + 17) / 34)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 21
normal! 038|
wincmd w
argglobal
if bufexists(fnamemodify("test/lib/build/sitemap.test.js", ":p")) | buffer test/lib/build/sitemap.test.js | else | edit test/lib/build/sitemap.test.js | endif
if &buftype ==# 'terminal'
  silent file test/lib/build/sitemap.test.js
endif
balt lib/utils/event.js
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=1
setlocal fml=1
setlocal fdn=10
setlocal nofen
let s:l = 32 - ((5 * winheight(0) + 17) / 34)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 32
normal! 0
wincmd w
4wincmd w
exe '1resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 1resize ' . ((&columns * 82 + 83) / 166)
exe '2resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 2resize ' . ((&columns * 82 + 83) / 166)
exe '3resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 3resize ' . ((&columns * 83 + 83) / 166)
exe '4resize ' . ((&lines * 34 + 35) / 71)
exe 'vert 4resize ' . ((&columns * 83 + 83) / 166)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
