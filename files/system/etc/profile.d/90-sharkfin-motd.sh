# shellcheck shell=sh
# Sharkfin login banner: fastfetch system summary with the sharkfin logo.
# Disable per-user with `touch ~/.config/no-show-user-motd` or export
# SHARKFIN_MOTD=0.

[ -t 0 ] || return 0                      # not a terminal (scp, cron, ...)
[ "${SHARKFIN_MOTD:-1}" = "0" ] && return 0
[ -n "${SHARKFIN_MOTD_SHOWN:-}" ] && return 0
[ -e "$HOME/.config/no-show-user-motd" ] && return 0
command -v ublue-fastfetch >/dev/null 2>&1 || return 0

SHARKFIN_MOTD_SHOWN=1
export SHARKFIN_MOTD_SHOWN
ublue-fastfetch