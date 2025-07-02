" React Shop Vim Configuration

" Basic settings
set nocompatible
set encoding=utf-8
set number
set ruler
set autoindent
set smartindent
set expandtab
set tabstop=2
set shiftwidth=2
set softtabstop=2
set smarttab
set backspace=indent,eol,start
set incsearch
set hlsearch
set ignorecase
set smartcase
set showmatch
set wildmenu
set wildmode=list:longest,full
set laststatus=2
set title
set scrolloff=3
set sidescrolloff=5
set wrap
set linebreak
set mouse=a
set clipboard=unnamed
set history=1000
set undolevels=1000
set showcmd
set showmode
set hidden
set ttyfast
set lazyredraw
set updatetime=300

" JavaScript & React specific settings
syntax enable
filetype plugin indent on
let g:jsx_ext_required = 0 " Allow JSX in .js files
autocmd FileType javascript setlocal ts=2 sts=2 sw=2
autocmd FileType javascriptreact setlocal ts=2 sts=2 sw=2
autocmd FileType typescript setlocal ts=2 sts=2 sw=2
autocmd FileType typescriptreact setlocal ts=2 sts=2 sw=2

" Better highlighting for JSX
autocmd BufRead,BufNewFile *.jsx set filetype=javascriptreact
autocmd BufRead,BufNewFile *.tsx set filetype=typescriptreact

" Set 2 space indentation for JSON files
autocmd FileType json setlocal ts=2 sts=2 sw=2

" Highlight trailing whitespace
highlight ExtraWhitespace ctermbg=red guibg=red
match ExtraWhitespace /\s\+$/
autocmd BufWinEnter * match ExtraWhitespace /\s\+$/
autocmd InsertEnter * match ExtraWhitespace /\s\+\%#\@<!$/
autocmd InsertLeave * match ExtraWhitespace /\s\+$/

" Strip trailing whitespace on save
autocmd BufWritePre * :%s/\s\+$//e

" If using plugins with vim-plug (commented out by default)
" Uncomment and install vim-plug to use these
"
" call plug#begin('~/.vim/plugged')
"
" " JavaScript/React plugins
" Plug 'pangloss/vim-javascript'
" Plug 'maxmellon/vim-jsx-pretty'
" Plug 'leafgarland/typescript-vim'
" Plug 'peitalin/vim-jsx-typescript'
" Plug 'prettier/vim-prettier', { 'do': 'npm install' }
"
" " Useful development plugins
" Plug 'mattn/emmet-vim'
" Plug 'tpope/vim-surround'
" Plug 'tpope/vim-commentary'
" Plug 'jiangmiao/auto-pairs'
" Plug 'neoclide/coc.nvim', {'branch': 'release'}
" Plug 'preservim/nerdtree'
" Plug 'airblade/vim-gitgutter'
" Plug 'itchyny/lightline.vim'
"
" call plug#end()
"
" " Emmet settings for JSX
" let g:user_emmet_settings = {
" \  'javascript' : {
" \    'extends' : 'jsx',
" \  },
" \}
"
" " NERDTree configuration
" nnoremap <C-n> :NERDTreeToggle<CR>
" let NERDTreeShowHidden=1

" Custom keybindings
nnoremap <silent> <C-j> :m +1<CR>
nnoremap <silent> <C-k> :m -2<CR> 