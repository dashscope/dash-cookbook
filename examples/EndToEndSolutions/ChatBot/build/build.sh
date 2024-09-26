#!/bin/bash

root_dir=`pwd`
rm -rf *.jar

cd $root_dir/../frontend/
frontend_dir=`pwd`
rm -rf dist

cd $root_dir/../backend/
backend_dir=`pwd`
rm -rf target
mkdir -p src/main/resources/static/
mkdir -p src/main/resources/templates/
rm -rf src/main/resources/static/*
rm -rf src/main/resources/templates/*

cd $frontend_dir
npm install
npm run build
cp -r dist/static     $backend_dir/src/main/resources/static/
cp -r dist/index.html $backend_dir/src/main/resources/templates/

cd $backend_dir
mvn package
cp target/chat.jar $root_dir/
cp src/main/resources/application.yml $root_dir/

cd $root_dir/
if [ $# == 1 ] && [ $1 == "docker" ]; then
  docker build -t chat-sample:1.0.1 .
fi
