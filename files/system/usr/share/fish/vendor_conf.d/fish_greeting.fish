function fish_greeting
    # Sharkfin: Bluefin's uwelcome banner is replaced by a fastfetch
    # system summary (sharkfin logo). Skipped if the bash login already
    # greeted us (SHARKFIN_MOTD_SHOWN is inherited from the parent shell).
    if test -e ~/.config/no-show-user-motd
        return
    end
    if test -n "$SHARKFIN_MOTD_SHOWN"
        return
    end
    if not set -q SHARKFIN_MOTD_SHOWN
        set -gx SHARKFIN_MOTD_SHOWN 1
        type -q ublue-fastfetch; and ublue-fastfetch
    end
end