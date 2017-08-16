#!/usr/bin/env bash

# Terminate script if anything fails
set +e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

FILE=$1

display_usage() {
  echo "This script combine prettier and eslint"
  echo -e "\nUsage:\nformat.sh file.js\n"
}

if [  $# -le 0 ]
then
  display_usage
  exit 1
fi

# check whether user had supplied -h or --help . If yes display usage
if [[ ( $1 == "--help") ||  $1 == "-h" ]]
then
  display_usage
  exit 0
fi

./node_modules/.bin/prettier --no-semi --print-width 100 --bracket-spacing --single-quote --trailing-comma es5 --write $FILE
