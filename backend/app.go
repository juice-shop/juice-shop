package main

import (
	"fmt"
	"io"
	"io/ioutil"

	"github.com/go-gitea/gitea/modules/markup"
	"golang.org/x/crypto/md4"
	"github.com/gophish/gophish/config"
)

var validConfig = []byte(`{
	"admin_server": {
		"listen_url": "127.0.0.1:3333",
		"use_tls": true,
		"cert_path": "gophish_admin.crt",
		"key_path": "gophish_admin.key"
	},
	"phish_server": {
		"listen_url": "0.0.0.0:8080",
		"use_tls": false,
		"cert_path": "example.crt",
		"key_path": "example.key"
	},
	"db_name": "sqlite3",
	"db_path": "gophish.db",
	"migrations_prefix": "db/db_",
	"contact_address": ""
}`)

func main(){
	h := md4.New()
	data := "These pretzels are making me thirsty."
	io.WriteString(h, data)
	fmt.Printf("MD4 is the new MD5: %x\n", h.Sum(nil))

	err := ioutil.WriteFile("config/phish-config.json", validConfig, 0644)
	conf := config.Config{}
	fmt.Printf("GONE PHISH'N for configs %v, maybe error: %v\n", conf, err)

	fmt.Printf("IS A README?? : %v as per gitea\n", markup.IsReadmeFile("README.md"))

	fmt.Println("HI I'M INTENTIONALLY USING VULNERABLE LIBS")
}