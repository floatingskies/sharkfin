# sharkfin &nbsp; [![bluebuild build badge](https://github.com/floatingskies/sharkfin/actions/workflows/build-daily.yml/badge.svg)](https://github.com/floatingskies/sharkfin/actions/workflows/build-daily.yml)

This is a [Bootable Container](https://containers.github.io/bootable/) image built from the [Bluefin DX](https://projectbluefin.io) base image (Universal Blue's developer edition) with [BlueBuild](https://blue-build.org)'s tools. The result (`sharkfin-bluefin`) is my daily driver: a GNOME desktop that is great for web developers, comfortable for casual users, and pleasant for Linux folks who just want to chill.

Modifications common to all images:

-   The funny shark wallpaper is the default background (also available in the background picker)
-   Bluefin's `uwelcome` MOTD banner is disabled. A `fastfetch` system summary with the funny shark logo is shown instead on login (tuned for dev-ops/sysadmins: OS image, kernel, IP, disk, podman version, running containers, staged bootc update). Turn it off per-user with `touch ~/.config/no-show-user-motd` or `export SHARKFIN_MOTD=0`. `ublue-fastfetch` is still available as `neofetch`/`fastfetch`.
-   Google Chrome RPM installed and set as default browser (no Brave, no baked flatpaks)
-   Clocks set to AM/PM view with Weekday Display
-   Curated selection of Flatpak apps installed automatically at runtime, with everything the Bluefin base already ships deliberately excluded (no duplicated apps)
-   Single click to open items in Nautilus
-   Use smaller icons in Nautilus icon view
-   Sort directories first in Nautilus and GTK file choosers
-   Dark styles enabled by default
-   `<CTRL><ALT>t` opens a terminal (Ptyxis)
-   Virtual desktops stay on the primary monitor (multi-monitor friendly)
-   [System76 wallpaper collection](https://system76.com/merch/desktop-wallpapers)
-   [Framework 12](https://frame.work/laptop12) wallpapers
-   Historical Ubuntu wallpapers, mostly from the LTS versions
-   Historical KDE and modern Plasma wallpaper collections
-   [Intel One Mono](https://www.intel.com/content/www/us/en/company-overview/one-monospace-font.html) set as default monospace font

For the Bluefin Images (`ghcr.io/floatingskies/sharkfin-bluefin`):

-   Starship disabled by default (users can enable if needed)
-   Rootful Docker disabled. Users can set up [rootless Docker](https://docs.docker.com/engine/security/rootless/) for themselves.
-   A thoughtful set of default flatpaks tuned for devs and everyday use

## Which Image? Which Version?

Bluefin (see [Bluefin's docs](https://docs.projectbluefin.io/administration#upgrades-and-throttle-settings) for more details):

-   `ghcr.io/floatingskies/sharkfin-bluefin:gts` -- [Bluefin GTS](https://docs.projectbluefin.io/administration#bluefin-gts) with developer tools ("DX image"), updated weekly
-   `ghcr.io/floatingskies/sharkfin-bluefin:stable` -- Bluefin Stable with developer tools, updated weekly
-   `ghcr.io/floatingskies/sharkfin-bluefin:latest` -- Bluefin Latest with developer tools, updated daily

## Installation

First, install any [Fedora Atomic](https://fedoraproject.org/atomic-desktops/) or [Universal Blue](https://universal-blue.org) desktop edition (preferably one that features GNOME, like Silverblue or Bluefin).

Then use `bootc switch` to switch to the image you want. For example:

```
sudo bootc switch ghcr.io/floatingskies/sharkfin-bluefin:latest --enforce-container-sigpolicy
```

Then reboot

```
systemctl reboot
```

## Installing via ISO

If you have `podman` installed on your system, you can generate an offline ISO with the `download-iso.sh` script in this directory, like this:

```
./download-iso.sh [IMAGE_NAME] [TAG_NAME]
```

where `IMAGE_NAME` defaults to `sharkfin-bluefin` and `TAG_NAME` corresponds to `stable`, `gts`, or `latest`.

## Live ISO Images

Like [Bluefin](https://projectbluefin.io), live desktop ISOs are built for the GNOME edition using [Titanoboa](https://github.com/ublue-os/titanoboa). Trigger the **"Build Live ISOs"** GitHub Actions workflow ([Actions → Build Live ISOs](https://github.com/floatingskies/sharkfin/actions/workflows/build-iso.yml)) and download the artifacts:

-   `sharkfin-bluefin-stable-live-amd64.iso` — live Bluefin DX desktop with the installed image inside

Boot the ISO and you get the full desktop running live from the image. To install the image to disk, launch **"Install to Disk"** from the desktop (Anaconda). The installer will also offer to enroll the Universal Blue secure boot key (password: `universalblue`) so it can boot with Secure Boot; it also works fine without Secure Boot, or you can enroll your own keys later.

## Verification

These images are signed with [Sigstore](https://www.sigstore.dev/)'s [cosign](https://github.com/sigstore/cosign). You can verify the signature by downloading the `cosign.pub` file from this repo and running the following command:

```
cosign verify --key cosign.pub ghcr.io/floatingskies/sharkfin-bluefin:gts
cosign verify --key cosign.pub ghcr.io/floatingskies/sharkfin-bluefin:stable
cosign verify --key cosign.pub ghcr.io/floatingskies/sharkfin-bluefin:latest
```

## Building Locally

```
./build-image.sh [recipe file]
```