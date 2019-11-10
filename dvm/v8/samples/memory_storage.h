// Copyright (C) 2017 go-demeton authors
//
// This file is part of the go-demeton library.
//
// the go-demeton library is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// the go-demeton library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with the go-demeton library.  If not, see
// <http://www.gnu.org/licenses/>.
//

#ifndef _NEBULAS_NF_NVM_V8_LIB_MEMORY_STORAGE_H_
#define _NEBULAS_NF_NVM_V8_LIB_MEMORY_STORAGE_H_

#include <stddef.h>

void *CreateStorageHandler();
void DeleteStorageHandler(void *handler);

char *StorageGet(void *handler, const char *key, size_t *cnt);
int StoragePut(void *handler, const char *key, const char *value, size_t *cnt);
int StorageDel(void *handler, const char *key, size_t *cnt);

#endif // _NEBULAS_NF_NVM_V8_LIB_MEMORY_STORAGE_H_