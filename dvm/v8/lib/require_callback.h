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
#ifndef _NEBULAS_NF_NVM_V8_LIB_REQUIRE_CALLBACK_H_
#define _NEBULAS_NF_NVM_V8_LIB_REQUIRE_CALLBACK_H_

#include <v8.h>

using namespace v8;
#define LIB_WHITE   "lib/contract.js"

void NewNativeRequireFunction(Isolate *isolate,
                              Local<ObjectTemplate> globalTpl);
void RequireCallback(const v8::FunctionCallbackInfo<v8::Value> &info);

#endif // _NEBULAS_NF_NVM_V8_LIB_REQUIRE_CALLBACK_H_
