#!/bin/sh
# Copyright 2007-2013 Gentoo Foundation
# Copyright 2007-2013 Mike Frysinger <vapier@gentoo.org>
# Copyright 2014-2015 Natanael Copa <ncopa@alpinelinux.org>
# Distributed under the terms of the GNU General Public License v2

argv0=${0##*/}
version=1.27

: "${ROOT:=/}"

[ "${ROOT}" = "${ROOT%/}" ] && ROOT="${ROOT}/"
[ "${ROOT}" = "${ROOT#/}" ] && ROOT="${PWD}/${ROOT}"

version() {
	exec echo "lddtree-${version}"
}

error() {
	echo "${argv0}: $*" 1>&2
	ret=1
	return 1
}

# functions for scanelf backend
elf_rpath_scanelf() {
	# shellcheck disable=SC2317
	scanelf -qF '#F%r' "$@"
}

elf_interp_scanelf() {
	# shellcheck disable=SC2317
	scanelf -qF '#F%i' "$@"
}

elf_needed_scanelf() {
	# shellcheck disable=SC2317
	scanelf -qF '#F%n' "$@"
}

elf_specs_scanelf() {
	# %a = machine (EM) type
	# %M = EI class
	# %D = endian
	# %I = osabi

	# With glibc, the NONE, SYSV, GNU, and LINUX OSABI's are compatible.
	# LINUX and GNU are the same thing, as are NONE and SYSV, so normalize
	# GNU & LINUX to NONE. #442024 #464380
	# shellcheck disable=SC2317
	scanelf -BF '#F%a %M %D %I' "$1" | \
		sed -E 's: (LINUX|GNU)$: NONE:'
}

# functions for binutils backend
elf_rpath_binutils() {
	# shellcheck disable=SC2317
	objdump -x "$@" | awk '$1 == "RUNPATH" { if($2!="") {runpath=$2;} }  $1 == "RPATH" { if($2!="") {rpath=$2;} } END { if(runpath!="") {print runpath;} else {print rpath;} }'
}

elf_interp_binutils() {
	# readelf -p .interp ouputs:
	#
	# String dump of section '.interp':
	#  [     0]  /lib/ld-musl-x86_64.so.1
	#
	# shellcheck disable=SC2317
	readelf  -p .interp "$1" | sed -E -n '/\[\s*[0-9]\]/s/^\s*\[.*\]\s*(.*)/\1/p'
}

elf_needed_binutils() {
	# shellcheck disable=SC2317
	objdump -x "$@" | awk '$1 == "NEEDED" { line=line sep $2 ; sep="," } END { print line }'
}

elf_specs_binutils() {
	# get Class, Data, Machine and OS/ABI.
	# the OS/ABI 'GNU', 'System V' and 'Linux' are compatible so normalize
	# shellcheck disable=SC2317
	readelf -h "$1" \
		| awk -F: '$1 ~ /Class|Data|Machine|OS.ABI/ {gsub(/^ +/, "", $2); print $2}' \
		| sed -E -e 's/UNIX - (System V|Linux|GNU)/UNIX/' \
		| tr '\n' ' '
}

# elf wrapper functions
elf_rpath() { elf_rpath_$BACKEND "$@"; }
elf_interp() { elf_interp_$BACKEND "$@"; }
elf_needed() { elf_needed_$BACKEND "$@"; }
elf_specs() { elf_specs_$BACKEND "$1"; }

unset lib_paths_fallback
for p in "${ROOT}"lib* "${ROOT}"usr/lib* "${ROOT}"usr/local/lib*; do
	lib_paths_fallback="${lib_paths_fallback}${lib_paths_fallback:+:}${p}"
done
c_ldso_paths_loaded='false'
find_elf() {
	_find_elf=''

	local elf="$1" needed_by="$2" interp=
	if [ "${elf}" != "${elf##*/}" ] && [ -e "${elf}" ] ; then
		_find_elf=${elf}
		return 0
	else
		check_paths() {
			local elf="$1"
			local pathstr="$2"
			IFS=:
			# shellcheck disable=SC2086
			set -- $pathstr
			unset IFS
			local path pe
			for path ; do
				: "${path:=${PWD}}"
				if [ "${path#"${ROOT}"}" = "${path}" ]; then
					path="${ROOT}${path#/}"
				fi
				pe="${path%/}/${elf#/}"
				if [ -e "${pe}" ] ; then
					if [ "$(elf_specs "${pe}")" = "${elf_specs}" ] ; then
						_find_elf=${pe}
						return 0
					fi
				fi
			done
			return 1
		}

		if [ "${c_last_needed_by}" != "${needed_by}" ] ; then
			c_last_needed_by="${needed_by}"
			c_last_needed_by_rpaths=$(elf_rpath "${needed_by}" | \
				sed -E -e 's|:| |g' -e "s:[$](ORIGIN|\{ORIGIN\}):${needed_by%/*}:")
		fi
		if [ -n "${c_last_needed_by_rpaths}" ]; then
			check_paths "${elf}" "${c_last_needed_by_rpaths}" && return 0
		fi

		if [ -n "${LD_LIBRARY_PATH}" ] ; then
			check_paths "${elf}" "${LD_LIBRARY_PATH}"
		fi

		if ! ${c_ldso_paths_loaded} ; then
			c_ldso_paths_loaded='true'
			c_ldso_paths=
			read_ldso_conf() {
				local line p
				for p ; do
					# if the glob didnt match anything #360041,
					# or the files arent readable, skip it
					[ -r "${p}" ] || continue
					while read -r line ; do
						case ${line} in
							"#"*) ;;
							"include "*) read_ldso_conf "${line#* }" ;;
							*) c_ldso_paths="$c_ldso_paths:${ROOT}${line#/}";;
						esac
					done <"${p}"
				done
			}
			local _oldpwd="$PWD"
			# the 'include' command is relative
			if cd "$ROOT"etc 2>/dev/null; then
				interp=$(elf_interp "${needed_by}")
				local ldso_conf="${ROOT}"etc/ld.so.conf
				case "$interp" in
					*/ld-musl-*)
						ldso_conf="${interp%.so*}"
						ldso_conf="${ROOT}"etc/${ldso_conf##*/}.path
						;;
				esac
				if [ -r "$ldso_conf" ]; then
					read_ldso_conf "$ldso_conf"
				fi
				cd "$_oldpwd" || return
			fi
		fi
		if [ -n "${c_ldso_paths}" ] ; then
			check_paths "${elf}" "${c_ldso_paths}" && return 0
		fi

		check_paths "${elf}" "${lib_paths_ldso:-${lib_paths_fallback}}" && return 0
	fi
	return 1
}

list_existing_file() {
	if [ -e "$1" ]; then
		echo "$1"
	else
		echo "$1: Not found." >&2
	fi
}

# echo all intermediate symlinks and return the resolved path in
# global variable _resolv_links
resolv_links() {
	_resolv_links="$1"
	_list_files="$2"
	local oldpwd="$PWD"
	[ "$_list_files" = yes ] && list_existing_file "${_resolv_links}"
	cd "${_resolv_links%/*}" || return
	while [ -L "$_resolv_links" ]; do
		_resolv_links=$(readlink "$_resolv_links")
		case "$_resolv_links" in
		/*)	_resolv_links="${ROOT}${_resolv_links#/}"
			cd "${_resolv_links%/*}" || break
			;;
		*/*)	cd "${_resolv_links%/*}" || break
			;;
		esac
		_resolv_links=$(pwd -P)/${_resolv_links##*/}
		[ "$_list_files" = yes ] && list_existing_file "${_resolv_links}"
	done
	cd "$oldpwd" || return
}

show_elf() {
	local elf="$1" indent="$2" parent_elfs="$3"
	local rlib lib libs
	local resolved
	find_elf "${elf}"
	resolved=${_find_elf}
	elf=${elf##*/}

	${LIST} || printf "%${indent}s%s => " "" "${elf}"
	case ",${parent_elfs}," in
	*,${elf},*)
		${LIST} || printf "!!! circular loop !!!\n"
		return
		;;
	esac
	parent_elfs="${parent_elfs},${elf}"
	if ${LIST} ; then
		resolv_links "${resolved:-$1}" yes
	else
		resolv_links "${resolved:-$1}" no
		printf "%s" "${resolved:-not found}"
	fi
	resolved=${_resolv_links}
	if [ "${indent:-0}" -eq 0 ] ; then
		local elf_specs interp full_interp

		elf_specs=$(elf_specs "${resolved}")
		interp=$(elf_interp "${resolved}")
		# ignore interpreters that do not have absolute path
		[ "${interp#/}" = "${interp}" ] && interp=
		[ -n "${interp}" ] && interp="${ROOT}${interp#/}"

		if ${LIST} ; then
			[ -n "${interp}" ] && resolv_links "${interp}" yes
		else
			printf "%s" " (interpreter => ${interp:-none})"
		fi
		if [ -r "${interp}" ] ; then
			# Extract the default lib paths out of the ldso.
			lib_paths_ldso=$(
				strings "${interp}" | \
				sed -nr -e "/^\/.*lib/{s|^/?|${ROOT}|;s|/$||;s|/?:/?|:${ROOT}|g;p}" | \
				tr '\n' ':'
			)
		fi
		full_interp=${interp}
		interp=${interp##*/}
		# If we are in non-list mode, then we want to show the "duplicate" interp
		# lines -- first the header (interp=>xxx), and then the DT_NEEDED line to
		# show that the ELF is directly linked against the interp.
		# If we're in list mode though, we only want to show the interp once.
		${LIST} && allhits="${allhits},${interp}"
	fi
	${LIST} || printf "\n"

	[ -z "${resolved}" ] && return

	libs=$(elf_needed "${resolved}")

	local my_allhits
	if ! ${SHOW_ALL} ; then
		my_allhits="${allhits}"
		allhits="${allhits},${libs}"
	fi

	oifs="$IFS"
	IFS=,
	# shellcheck disable=SC2086
	set -- ${libs}
	IFS="$oifs"

	for lib; do
		lib=${lib##*/}
		# No need for leading comma w/my_allhits as we guarantee it always
		# starts with one due to the way we append the value above.
		case "${my_allhits}," in
			*,${lib},*) continue;;
		esac
		# If the interp is being linked against directly, re-use the existing
		# full path rather than perform a search for it.  When systems symlink
		# the interp to a diff location, we might locate a different path, and
		# displaying both doesn't make sense as it doesn't match the runtime --
		# the ldso won't load another copy of ldso into memory from the search
		# path, it'll re-use the existing copy that was loaded from the full
		# hardcoded path.
		if [ "${lib}" = "${interp}" ]; then
			rlib=${full_interp}
		else
			find_elf "${lib}" "${resolved}"
			rlib=${_find_elf}
		fi
		show_elf "${rlib:-${lib}}" $(( ${indent:-0} + 4)) "${parent_elfs}"
	done
}

usage() {
	cat <<-EOF
	Display ELF dependencies as a tree

	Usage: ${argv0} [options] ELFFILE...

	Options:
	  -a, --all           Show all duplicated dependencies
	  -h, --help          Show this help output
	  -l, --flat          Display output in a flat format
	      --no-auto-root  Do not automatically prefix input ELFs with ROOT
	  -R, --root ROOT     Use this ROOT filesystem tree
	  -V, --version       Show version information
	  -x, --debug         Run with debugging
	EOF
}

SHOW_ALL=false
SET_X=false
LIST=false
AUTO_ROOT=true

if ! OPTS=$(getopt -n "$argv0" -o "ahlR:Vx" -l "all,help,list,no-auto-root,root:,version,debug" -- "$@"); then
	usage >&2
	exit 1
fi
eval set -- "$OPTS"
while true; do
	case "$1" in
		-a|--all) SHOW_ALL=true;;
		-x|--debug) SET_X=true;;
		-h|--help) usage; exit 0;;
		-V|--version) version;;
		-R|--root) shift; ROOT="$1";;
		-l|--list) LIST=true;;
		--no-auto-root) AUTO_ROOT=false;;
		--) shift; break;;
	esac
	shift
done

if [ -z "$1" ]; then
	usage >&2
	exit 1
fi

${SET_X} && set -x

if which scanelf >/dev/null 2>&1; then
	BACKEND=scanelf
elif which objdump >/dev/null 2>&1 && which readelf >/dev/null 2>&1; then
	BACKEND=binutils
else
	error "This tool needs either scanelf or binutils (objdump and readelf)"
	exit 1
fi

ret=0
for elf ; do
	unset lib_paths_ldso
	unset c_last_needed_by
	if ${AUTO_ROOT} && [ -z "${elf##/*}" ] ; then
		elf="${ROOT}${elf#/}"
	fi
	if [ ! -e "${elf}" ] ; then
		error "${elf}: file does not exist"
	elif [ ! -r "${elf}" ] ; then
		error "${elf}: file is not readable"
	elif [ -d "${elf}" ] ; then
		if $LIST; then
			echo "${elf}"
		else
			error "${elf}: is a directory"
		fi
	else
		allhits=""
		[ "${elf##*/*}" = "${elf}" ] && elf="./${elf}"
		show_elf "${elf}"
	fi
done
exit ${ret}

