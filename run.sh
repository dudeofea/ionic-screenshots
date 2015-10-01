ORG_PATH=`pwd`
cd $1
ionic serve -p 8888 &
IONIC_PID=$!
phantomjs $ORG_PATH/scraper.js
kill -2 $IONIC_PID
