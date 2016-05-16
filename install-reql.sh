#!/bin/bash

# Make sure to run this script as sudo su!

export DEBIAN_FRONTEND=noninteractive
export SERVER_NAME=accelerated
export SERVER_PORT=9090
export BIND=all

echo "[accelerated.api.model/reql.sh] Installing rethinkdb ..."

echo "[accelerated.api.model/reql.sh] -- Installing ubuntu rethinkdb drivers"

source /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | tee /etc/apt/sources.list.d/rethinkdb.list > /dev/null
wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | apt-key add - > /dev/null
apt-get update -y > /dev/null
apt-get install rethinkdb -y --force-yes > /dev/null

echo "[accelerated.api.model/reql.sh] -- Installing node rethinkdb drivers"

npm install rethinkdb --save --loglevel=error > /dev/null

echo "[accelerated.api.model/reql.sh] -- Configuring rethinkdb"

cp /etc/rethinkdb/default.conf.sample /etc/rethinkdb/instances.d/accelerated.conf
echo "" >> /etc/rethinkdb/instances.d/accelerated.conf
echo "bind=$BIND" >> /etc/rethinkdb/instances.d/accelerated.conf
echo "http-port=$SERVER_PORT" >> /etc/rethinkdb/instances.d/accelerated.conf
echo "server-name=$SERVER_NAME" >> /etc/rethinkdb/instances.d/accelerated.conf
echo "" >> /etc/rethinkdb/instances.d/accelerated.conf

echo "[accelerated.api.model/reql.sh] -- Restarting rethinkdb service"

/etc/init.d/rethinkdb restart

echo "[accelerated.api.model/reql.sh] Finished installing rethinkdb!"