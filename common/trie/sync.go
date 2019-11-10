// Copyright (C) 2017 go-demeton authors
//
// This file is part of the go-demeton library.
//
// the go-demeton library is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// the go-demeton library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with the go-demeton library.  If not, see <http://www.gnu.org/licenses/>.
//

package trie

// SyncTrie data from other servers
// Sync whole trie to build snapshot
func (t *Trie) SyncTrie(rootHash []byte) error {
	return nil
}

// SyncPath from rootHash to key node from other servers
// Useful for verification quickly
func (t *Trie) SyncPath(rootHash []byte, key []byte) error {
	return nil
}
