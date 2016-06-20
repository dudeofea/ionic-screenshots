ORG_PATH=`pwd`
cd $1
node $ORG_PATH/node_modules/.bin/http-server -p 8888 www > /dev/null &
IONIC_PID=$!
cd $ORG_PATH
phantomjs $ORG_PATH/scraper.js
kill -2 $IONIC_PID
