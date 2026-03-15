/**
 * Shell completion for mini-astro CLI
 * Usage: mini-astro completion bash | mini-astro completion zsh
 */

export const COMMANDS = [
  'init',
  'create',
  'new',
  'build',
  'dev',
  'quarks',
  'component',
  'template',
  'route',
  'page',
  'completion',
  'help',
];

export const COMPONENT_LAYERS = ['atom', 'atoms', 'molecule', 'molecules', 'organism', 'organisms'];

export function getBashCompletionScript() {
  const cmdList = COMMANDS.join(' ');
  return `# Bash completion for mini-astro
_mini_astro() {
  local cur prev
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=($(compgen -W "${cmdList}" -- "$cur"))
    return
  fi

  case "$prev" in
    component)
      if [ "$COMP_CWORD" -eq 2 ]; then
        COMPREPLY=($(compgen -f -- "$cur"))
      elif [ "$COMP_CWORD" -eq 3 ]; then
        COMPREPLY=($(compgen -W "atom atoms molecule molecules organism organisms" -- "$cur"))
      fi
      ;;
    template|route|page|create|new)
      [ "$COMP_CWORD" -eq 2 ] && COMPREPLY=($(compgen -f -- "$cur"))
      ;;
    completion)
      [ "$COMP_CWORD" -eq 2 ] && COMPREPLY=($(compgen -W "bash zsh" -- "$cur"))
      ;;
    help)
      [ "$COMP_CWORD" -eq 2 ] && COMPREPLY=($(compgen -W "${cmdList}" -- "$cur"))
      ;;
    -C|--cwd)
      COMPREPLY=($(compgen -d -- "$cur"))
      ;;
  esac
}

complete -F _mini_astro mini-astro
`;
}

export function getZshCompletionScript() {
  const cmds = COMMANDS.join(' ');
  return `# Zsh completion for mini-astro
_mini_astro() {
  _arguments -C \\
    '(-C --cwd)-C[Run in directory]:dir:_files -/' \\
    '(-h --help)-h[Show help]' \\
    '1:command:(${cmds})' \\
    '*::arg:->args'
  case $state in
    args)
      case $line[1] in
        component)
          _arguments '2:name:' '3:layer:(atom atoms molecule molecules organism organisms)'
          ;;
        template|route|page|create|new)
          _arguments '2:name:'
          ;;
        completion)
          _arguments '2:shell:(bash zsh)'
          ;;
        help)
          _arguments '2:command:(${cmds})'
          ;;
      esac
  esac
}

_mini_astro "$@"
`;
}

export function runCompletion(shell) {
  const sh = (shell || process.env.MINI_ASTRO_SHELL || 'bash').toLowerCase();
  if (sh === 'zsh') {
    return getZshCompletionScript();
  }
  return getBashCompletionScript();
}
