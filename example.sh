#!/bin/bash

# pass our desired absolute path to install example as 
# npm run-script example YOUR_ABSOLUTE_PATH_HERE

rsync -avP apiExample $1
