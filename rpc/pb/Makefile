# Copyright (C) 2017 go-demeton authors
#
# This file is part of the go-demeton library.
#
# the go-demeton library is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# the go-demeton library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with the go-demeton library.  If not, see <http://www.gnu.org/licenses/>.
#
PB = $(wildcard *.proto)
GO = $(PB:.proto=.pb.go)

all: $(GO)

%.pb.go: %.proto
	protoc -I/usr/local/include -I. -I../../../../../../src -I../../vendor/github.com/cyber-demeton/grpc-gateway/third_party/googleapis --gogo_out=plugins=grpc:. --grpc-gateway_out=logtostderr=true:. $<
	sed 's/grpc-ecosystem/cyber-demeton/g' rpc.pb.gw.go > tmp
	mv tmp rpc.pb.gw.go
clean:
	rm *.go
