/**
 * `strndup' implementation based on:
 * http://ftp.fr.openbsd.org/pub/OpenBSD/src/kerberosV/src/lib/roken/strndup.c
 * http://ftp.fr.openbsd.org/pub/OpenBSD/src/kerberosV/src/lib/roken/strnlen.c
 *
 * Copyright (c) 1995 - 1999 Kungliga Tekniska Högskolan
 * (Royal Institute of Technology, Stockholm, Sweden).
 * All rights reserved.
 *
 * Modifications by David Humphrey <david.humphrey@senecacollege.ca> 2012
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */
#ifndef __NODE_STRNDUP_H__
#define __NODE_STRNDUP_H__

inline size_t
strnlen(const char *s, size_t len) {
  size_t i;

  for(i = 0; i < len && s[i]; i++)
    ;
  return i;
};

inline char *
strndup(const char *old, size_t sz) {
  size_t len = strnlen (old, sz);
  char *t = (char *)malloc(len + 1);

  if (t != NULL) {
    memcpy (t, old, len);
    t[len] = '\0';
  }
  return t;
};

#endif /* __NODE_STRNDUP_H__ */
