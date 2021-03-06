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

package main

import (
	"os"

	"github.com/cyber-demeton/go-demeton/cmd/console"
	"github.com/urfave/cli"
)

var (
	consoleCommand = cli.Command{
		Action:   MergeFlags(consoleStart),
		Name:     "console",
		Usage:    "Start an interactive JavaScript console",
		Category: "CONSOLE COMMANDS",
		Description: `
The Deb console is an interactive shell for the JavaScript runtime environment.`,
	}
)

func consoleStart(ctx *cli.Context) error {
	deb, err := makeNeb(ctx)
	if err != nil {
		return err
	}

	console := console.New(console.Config{
		Prompter:   console.Stdin,
		PrompterCh: make(chan string),
		Writer:     os.Stdout,
		Deb:        deb,
	})

	console.Setup()
	console.Interactive()
	defer console.Stop()
	return nil
}
